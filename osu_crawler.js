const fs = require('fs');
const path = require('path');
const axios = require('axios');
const ProgressBar = require('progress');

// 加载配置文件
function loadConfig() {
    const configPath = path.resolve(process.cwd(), 'config.json');
    console.log('加载配置文件:', configPath);
    
    if (fs.existsSync(configPath)) {
        try {
            const configContent = fs.readFileSync(configPath, 'utf8');
            return JSON.parse(configContent);
        } catch (error) {
            console.error('配置文件解析失败:', error.message);
            return null;
        }
    }
    console.error('配置文件不存在:', configPath);
    return null;
}

// 直接读取和解析 .env 文件
function loadEnvFile() {
    const envPath = path.resolve(process.cwd(), '.env');
    console.log('加载环境变量文件:', envPath);
    
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const envVars = {};
        
        envContent.split('\n').forEach(line => {
            line = line.trim();
            if (line && !line.startsWith('#')) {
                const [key, value] = line.split('=');
                if (key && value) {
                    envVars[key.trim()] = value.trim();
                }
            }
        });
        
        return envVars;
    }
    return null;
}

const env = loadEnvFile();
if (!env) {
    throw new Error('无法加载 .env 文件');
}

const config = loadConfig();
if (!config) {
    throw new Error('无法加载配置文件');
}

class OsuBeatmapDownloader {
    constructor(config) {
        this.config = config;
        this.baseUrl = 'https://osu.ppy.sh/api/v2';
        this.clientId = env.OSU_CLIENT_ID;
        this.clientSecret = env.OSU_CLIENT_SECRET;
        
        // 调试信息
        console.log('\n凭据信息:');
        console.log('Client ID:', this.clientId);
        console.log('Client Secret:', this.clientSecret?.substring(0, 5) + '...');
        
        // 验证凭据格式
        if (!this.clientId || !this.clientSecret || 
            this.clientId === 'your_client_id_here' || 
            this.clientSecret === 'your_client_secret_here') {
            throw new Error('.env 文件中的凭据未被正确加载，请检查文件内容和格式');
        }
        
        this.accessToken = null;
        this.downloadDir = path.join(process.cwd(), this.config.download.directory);
        
        // 创建下载目录
        if (!fs.existsSync(this.downloadDir)) {
            fs.mkdirSync(this.downloadDir);
        }
    }

    async authenticate() {
        try {
            console.log('尝试认证...');
            const response = await axios.post('https://osu.ppy.sh/oauth/token', {
                client_id: this.clientId,
                client_secret: this.clientSecret,
                grant_type: 'client_credentials',
                scope: 'public'
            });
            
            this.accessToken = response.data.access_token;
            console.log('认证成功！');
            return true;
        } catch (error) {
            console.error('认证失败:', error.message);
            if (error.response) {
                console.error('错误详情:', error.response.data);
            }
            return false;
        }
    }

    async searchBeatmaps(params) {
        try {
            const response = await axios.get(`${this.baseUrl}/beatmapsets/search`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                },
                params: {
                    q: params.query || '',
                    m: params.mode || 'osu',
                    s: params.status || 'ranked',
                    sort: params.sort || 'difficulty_rating',
                    ...params
                }
            });
            
            return response.data.beatmapsets;
        } catch (error) {
            console.error('搜索谱面失败:', error.message);
            return [];
        }
    }

    async downloadBeatmap(beatmapsetId, filename) {
        try {
            console.log(`开始下载谱面 ${beatmapsetId}...`);
            const response = await axios({
                method: 'get',
                url: `https://osu.ppy.sh/beatmapsets/${beatmapsetId}/download`,
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                },
                responseType: 'stream'
            });

            const totalLength = parseInt(response.headers['content-length']);
            let progressBar;
            
            if (!isNaN(totalLength) && totalLength > 0) {
                progressBar = new ProgressBar('下载进度 [:bar] :percent :etas', {
                    width: 40,
                    complete: '=',
                    incomplete: ' ',
                    renderThrottle: 1,
                    total: totalLength
                });
            } else {
                console.log('无法获取文件大小，将不显示进度条');
            }

            const writer = fs.createWriteStream(path.join(this.downloadDir, filename));
            let downloadedBytes = 0;
            
            response.data.on('data', (chunk) => {
                downloadedBytes += chunk.length;
                if (progressBar) {
                    progressBar.tick(chunk.length);
                } else {
                    process.stdout.write(`\r已下载: ${(downloadedBytes / 1024 / 1024).toFixed(2)} MB`);
                }
            });

            return new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    if (!progressBar) {
                        console.log('\n下载完成！');
                    }
                    resolve();
                });
                writer.on('error', reject);
                response.data.pipe(writer);
            });
        } catch (error) {
            console.error(`下载谱面 ${beatmapsetId} 失败:`, error.message);
            if (error.response) {
                console.error('错误详情:', error.response.data);
            }
            return false;
        }
    }

    async downloadBeatmaps() {
        if (!this.accessToken && !(await this.authenticate())) {
            console.error('无法进行认证，请检查API凭据');
            return;
        }

        const beatmaps = await this.searchBeatmaps(this.config.search);
        console.log(`找到 ${beatmaps.length} 个符合条件的谱面`);

        // 应用额外的过滤条件
        const filteredBeatmaps = beatmaps.filter(beatmap => {
            const filters = this.config.filters;
            if (filters.min_length && beatmap.total_length < filters.min_length) return false;
            if (filters.max_length && beatmap.total_length > filters.max_length) return false;
            if (filters.min_bpm && beatmap.bpm < filters.min_bpm) return false;
            if (filters.max_bpm && beatmap.bpm > filters.max_bpm) return false;
            if (filters.genre && beatmap.genre.id !== filters.genre) return false;
            if (filters.language && beatmap.language.id !== filters.language) return false;
            return true;
        });

        console.log(`过滤后剩余 ${filteredBeatmaps.length} 个谱面`);

        const downloadCount = Math.min(this.config.search.limit, filteredBeatmaps.length);
        for (let i = 0; i < downloadCount; i++) {
            const beatmap = filteredBeatmaps[i];
            const filename = this.config.download.filename_template
                .replace('{id}', beatmap.id)
                .replace('{title}', beatmap.title)
                + '.osz';
            
            console.log(`\n正在下载 (${i + 1}/${downloadCount}): ${beatmap.title}`);
            await this.downloadBeatmap(beatmap.id, filename);
        }
    }
}

// 使用示例
async function main() {
    const downloader = new OsuBeatmapDownloader(config);
    await downloader.downloadBeatmaps();
}

if (require.main === module) {
    main().catch(console.error);
} 