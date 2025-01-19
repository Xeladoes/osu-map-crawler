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
                // 找到第一个等号的位置
                const eqIdx = line.indexOf('=');
                if (eqIdx > 0) {
                    const key = line.slice(0, eqIdx).trim();
                    let value = line.slice(eqIdx + 1).trim();
                    
                    // 处理带引号的值
                    if ((value.startsWith('"') && value.endsWith('"')) ||
                        (value.startsWith("'") && value.endsWith("'"))) {
                        value = value.slice(1, -1);
                    }
                    
                    envVars[key] = value;
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

        // 加载镜像站点配置
        const mirrorsPath = path.resolve(process.cwd(), 'mirrors.json');
        if (!fs.existsSync(mirrorsPath)) {
            throw new Error('mirrors.json 配置文件不存在');
        }
        this.mirrorsConfig = JSON.parse(fs.readFileSync(mirrorsPath, 'utf8'));

        // 创建 axios 实例
        this.client = axios.create({
            maxRedirects: 5,
            validateStatus: function (status) {
                return status >= 200 && status < 400;
            }
        });
    }

    async authenticate() {
        try {
            console.log('尝试获取访问令牌...');
            const response = await axios.post('https://osu.ppy.sh/oauth/token', {
                client_id: this.clientId,
                client_secret: this.clientSecret,
                grant_type: 'client_credentials',
                scope: 'public'
            });

            this.accessToken = response.data.access_token;
            console.log('成功获取访问令牌！');
            
            // 设置全局默认请求头
            this.client.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`;
            
            return true;
        } catch (error) {
            console.error('获取访问令牌失败:', error.message);
            if (error.response?.data) {
                console.error('错误详情:', error.response.data);
            }
            return false;
        }
    }

    async searchBeatmaps(params, page = 1) {
        try {
            const response = await this.client.get(`${this.baseUrl}/beatmapsets/search`, {
                params: {
                    q: params.query || '',
                    m: params.mode || 'osu',
                    s: params.status || 'ranked',
                    sort: params.sort || 'difficulty_rating',
                    page: page,
                    ...params
                }
            });
            
            return {
                beatmapsets: response.data.beatmapsets,
                total: response.data.total,
                cursor: response.data.cursor_string
            };
        } catch (error) {
            console.error('搜索谱面失败:', error.message);
            return { beatmapsets: [], total: 0 };
        }
    }

    async downloadBeatmap(beatmapsetId, filename) {
        try {
            console.log(`开始下载谱面 ${beatmapsetId}...`);
            
            // 获取启用的镜像站点并按优先级排序
            const mirrors = this.mirrorsConfig.mirrors
                .filter(mirror => mirror.enabled)
                .sort((a, b) => a.priority - b.priority);

            if (mirrors.length === 0) {
                throw new Error('没有可用的镜像站点');
            }

            // 尝试从每个镜像站点下载
            for (const mirror of mirrors) {
                try {
                    console.log(`尝试从 ${mirror.name} 下载...`);
                    
                    // 替换 URL 模板中的变量
                    const url = mirror.url_template.replace('{beatmapset_id}', beatmapsetId);
                    
                    const response = await axios({
                        method: 'get',
                        url: url,
                        headers: mirror.headers,
                        responseType: 'stream',
                        timeout: mirror.timeout,
                        maxRedirects: 5,
                        validateStatus: function (status) {
                            return status === 200;
                        }
                    });

                    // 检查响应头
                    const contentType = response.headers['content-type'];
                    const contentLength = parseInt(response.headers['content-length']);

                    // 如果文件太小或内容类型不正确，可能是错误页面
                    if (contentLength < this.mirrorsConfig.download_options.min_file_size || 
                        (contentType && (contentType.includes('text/html') || contentType.includes('application/json')))) {
                        console.log(`从 ${mirror.name} 收到了非谱面文件或文件太小，跳过...`);
                        continue;
                    }

                    const totalLength = contentLength;
                    let progressBar;
                    
                    if (!isNaN(totalLength) && totalLength > 0) {
                        const sizeMB = (totalLength / 1024 / 1024).toFixed(2);
                        console.log(`文件大小: ${sizeMB} MB`);
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
                    let lastProgressUpdate = Date.now();

                    response.data.on('data', (chunk) => {
                        downloadedBytes += chunk.length;
                        if (progressBar) {
                            progressBar.tick(chunk.length);
                        } else {
                            const now = Date.now();
                            if (now - lastProgressUpdate > this.mirrorsConfig.download_options.progress_update_interval) {
                                process.stdout.write(`\r已下载: ${(downloadedBytes / 1024 / 1024).toFixed(2)} MB`);
                                lastProgressUpdate = now;
                            }
                        }
                    });

                    await new Promise((resolve, reject) => {
                        const timeout = setTimeout(() => {
                            writer.end();
                            reject(new Error('下载超时'));
                        }, this.mirrorsConfig.download_options.download_timeout);

                        writer.on('finish', () => {
                            clearTimeout(timeout);
                            if (totalLength && downloadedBytes !== totalLength) {
                                reject(new Error(`文件大小不匹配: 预期 ${totalLength} 字节，实际 ${downloadedBytes} 字节`));
                                return;
                            }
                            if (!progressBar) {
                                console.log('\n下载完成！');
                            }
                            resolve();
                        });

                        writer.on('error', (err) => {
                            clearTimeout(timeout);
                            reject(err);
                        });

                        response.data.on('error', (err) => {
                            clearTimeout(timeout);
                            writer.end();
                            reject(err);
                        });

                        response.data.pipe(writer);
                    });

                    console.log(`从 ${mirror.name} 下载成功！`);
                    return true;
                } catch (error) {
                    console.error(`从 ${mirror.name} 下载失败:`, error.message);
                    // 删除不完整的文件
                    const filePath = path.join(this.downloadDir, filename);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                    
                    // 如果是网络错误，等待一会再尝试下一个镜像
                    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
                        await new Promise(resolve => setTimeout(resolve, this.mirrorsConfig.download_options.retry_delay));
                    }
                    continue;  // 尝试下一个镜像
                }
            }

            throw new Error('所有镜像站点下载均失败');
        } catch (error) {
            console.error(`下载谱面 ${beatmapsetId} 失败:`, error.message);
            return false;
        }
    }

    async downloadBeatmaps() {
        if (!this.accessToken && !(await this.authenticate())) {
            console.error('无法进行认证，请检查API凭据');
            return;
        }

        let allBeatmaps = [];
        let page = 1;
        let totalBeatmaps = 0;
        
        // 获取所有符合条件的谱面
        do {
            const result = await this.searchBeatmaps(this.config.search, page);
            if (!result.beatmapsets.length) break;
            
            if (page === 1) {
                totalBeatmaps = result.total;
                console.log(`总共找到 ${totalBeatmaps} 个符合条件的谱面`);
            }
            
            allBeatmaps = allBeatmaps.concat(result.beatmapsets);
            console.log(`已获取第 ${page} 页，当前共 ${allBeatmaps.length} 个谱面`);
            
            if (this.config.search.limit && allBeatmaps.length >= this.config.search.limit) {
                allBeatmaps = allBeatmaps.slice(0, this.config.search.limit);
                break;
            }
            
            page++;
            // 添加延迟以避免请求过快
            await new Promise(resolve => setTimeout(resolve, 1000));
        } while (true);

        // 应用额外的过滤条件
        const filteredBeatmaps = allBeatmaps.filter(beatmap => {
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

        const downloadCount = this.config.search.limit 
            ? Math.min(this.config.search.limit, filteredBeatmaps.length)
            : filteredBeatmaps.length;

        for (let i = 0; i < downloadCount; i++) {
            const beatmap = filteredBeatmaps[i];
            const filename = this.config.download.filename_template
                .replace('{id}', beatmap.id)
                .replace('{title}', beatmap.title)
                + '.osz';
            
            console.log(`\n正在下载 (${i + 1}/${downloadCount}): ${beatmap.title}`);
            await this.downloadBeatmap(beatmap.id, filename);
            
            // 添加下载间隔以避免请求过快
            if (i < downloadCount - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
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