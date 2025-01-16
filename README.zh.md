# osu! 谱面下载器

[English](README.md) | [中文](README.zh.md)

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