# osu! 谱面下载器 / osu! Beatmap Downloader

<div align="center">
  <button id="lang-zh" onclick="switchLanguage('zh')" style="margin: 5px; padding: 5px 10px;">中文</button>
  <button id="lang-en" onclick="switchLanguage('en')" style="margin: 5px; padding: 5px 10px;">English</button>
</div>

<div id="readme-zh">

这是一个用于批量下载 osu! 谱面的自动化工具。通过 osu! API v2 接口，可以方便地搜索和下载你想要的谱面。

## 功能特点

- 支持通过 osu! API v2 进行谱面搜索
- 支持批量下载谱面
- 可配置的下载参数
- 显示下载进度条
- 自动重试机制

## 环境要求

- Node.js (建议版本 >= 14)
- npm 包管理器

## 安装

1. 克隆本仓库：
```bash
git clone [你的仓库地址]
cd osu_map_crawler
```

2. 安装依赖：
```bash
npm install
```

3. 配置环境变量：
   - 复制 `.env.example` 文件为 `.env`
   - 在 `.env` 文件中填入你的 osu! API 凭据：
```
CLIENT_ID=你的client_id
CLIENT_SECRET=你的client_secret
```

4. 获取 osu! API 凭据：
   - 访问 [osu! 开发者页面](https://osu.ppy.sh/home/account/edit#oauth)
   - 点击 "New OAuth Application"
   - 填写应用名称（如 "osu map crawler"）
   - 回调 URL 可填写 `http://localhost:3000/callback`（本工具不会实际使用）
   - 创建后，你将获得 Client ID 和 Client Secret
   - 将这些凭据填入 `.env` 文件中

## 配置说明

在 `config.json` 文件中可以配置以下参数：
- 搜索条件（难度、模式等）
- 下载目录
- 其他下载选项

## 使用方法

运行程序：
```bash
npm start
```

## 注意事项

- 请确保你有足够的磁盘空间
- 遵守 osu! 的 API 使用规范
- 下载的谱面文件将保存在 `downloads` 目录中

## 依赖项

- axios: 用于发送 HTTP 请求
- progress: 用于显示下载进度条
- dotenv: 用于环境变量管理

</div>

<div id="readme-en" style="display: none;">

This is an automated tool for batch downloading osu! beatmaps. Using the osu! API v2 interface, you can easily search and download the beatmaps you want.

## Features

- Support beatmap search through osu! API v2
- Batch download support
- Configurable download parameters
- Download progress bar
- Automatic retry mechanism

## Requirements

- Node.js (recommended version >= 14)
- npm package manager

## Installation

1. Clone this repository:
```bash
git clone [your repository URL]
cd osu_map_crawler
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your osu! API credentials in the `.env` file:
```
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
```

4. Get osu! API credentials:
   - Visit [osu! Developer Console](https://osu.ppy.sh/home/account/edit#oauth)
   - Click "New OAuth Application"
   - Fill in the application name (e.g., "osu map crawler")
   - Callback URL can be set to `http://localhost:3000/callback` (not actually used by this tool)
   - After creation, you will receive a Client ID and Client Secret
   - Fill these credentials in your `.env` file

## Configuration

In the `config.json` file, you can configure the following parameters:
- Search conditions (difficulty, mode, etc.)
- Download directory
- Other download options

## Usage

Run the program:
```bash
npm start
```

## Notes

- Ensure you have enough disk space
- Comply with osu! API usage guidelines
- Downloaded beatmaps will be saved in the `downloads` directory

## Dependencies

- axios: For sending HTTP requests
- progress: For displaying download progress
- dotenv: For environment variable management

</div>

<script>
function switchLanguage(lang) {
    document.getElementById('readme-zh').style.display = lang === 'zh' ? 'block' : 'none';
    document.getElementById('readme-en').style.display = lang === 'en' ? 'block' : 'none';
    document.getElementById('lang-zh').style.fontWeight = lang === 'zh' ? 'bold' : 'normal';
    document.getElementById('lang-en').style.fontWeight = lang === 'en' ? 'bold' : 'normal';
}

// Initialize with Chinese language
switchLanguage('zh');
</script>

