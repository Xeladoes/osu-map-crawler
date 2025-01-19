# osu! 谱面下载工具

[English](README.md) | [中文](README.zh.md)

一个基于搜索条件下载 osu! 谱面的工具。你可以指定难度星级、模式、作图者等条件来查找和下载你需要的谱面。

## 功能特点

- **搜索和下载**
  - 按星级、游戏模式、作图者等条件筛选
  - 使用关键词搜索谱面（歌曲名称、艺术家等）
  - 查找符合条件的谱面
  - 构建练习谱面集
- **镜像站下载**
  - 从多个镜像站点下载
  - 下载失败时切换镜像
  - 可设置镜像优先级
  - 支持的镜像站：
    - sayobot.cn（Sayobot）
    - chimu.moe（Chimu）
    - kitsu.moe（Kitsu）
    - nerina.pw（Nerina）
- **下载功能**
  - 批量下载并显示进度
  - 失败时重试
  - 文件完整性检查
  - 可配置参数
- 使用 osu! API v2 进行搜索

## 系统要求

- Node.js（推荐版本 >= 14）
- npm 包管理器

## 安装步骤

1. 克隆此仓库：
```bash
git clone [你的仓库 URL]
cd osu_map_crawler
```

2. 安装依赖：
```bash
npm install
```

3. 配置环境变量：
   - 将 `.env.example` 复制为 `.env`
   - 在 `.env` 文件中填入你的 osu! API 凭据：
```
CLIENT_ID=你的客户端ID
CLIENT_SECRET=你的客户端密钥
```

4. 获取 osu! API 凭据：
   - 访问 [osu! 开发者控制台](https://osu.ppy.sh/home/account/edit#oauth)
   - 点击"新建 OAuth 应用"
   - 填写应用名称（例如："osu map crawler"）
   - 回调 URL 可以设置为 `http://localhost:3000/callback`（本工具实际不会使用）
   - 创建后，你将获得客户端 ID 和客户端密钥
   - 将这些凭据填入你的 `.env` 文件

## 配置说明

本工具使用两个配置文件：

1. `config.json` - 主配置文件：
   - 搜索条件
     - 难度星级范围
     - 游戏模式
     - 作图者名称
     - 关键词（歌曲名称、艺术家、标签）
   - 下载目录
   - 其他下载选项

2. `mirrors.json` - 镜像站点配置：
   - 镜像站 URL 和优先级
   - 下载参数
   - 请求头设置
   - 超时设置

你可以根据自己的需求自定义这些配置文件。

## 使用方法

运行程序：
```bash
npm start
```

## 工作原理

1. 使用 osu! API v2 搜索符合条件的谱面
2. 使用配置的镜像站点下载找到的谱面
3. 如果某个镜像失败，自动尝试其他镜像
4. 验证下载文件的完整性

## 注意事项

- 确保有足够的磁盘空间
- 遵守 osu! API 使用指南
- 下载的谱面将保存在 `downloads` 目录中
- 本工具现在使用镜像站下载，比直接下载更可靠
- 你可以在 `mirrors.json` 中配置镜像站的优先级

## 依赖项

- axios：用于发送 HTTP 请求
- progress：用于显示下载进度
- dotenv：用于环境变量管理

## 构建

构建可执行文件：

```bash
# 为当前平台构建
npm run build

# 为特定平台构建
npm run build:win   # Windows
npm run build:mac   # macOS
npm run build:linux # Linux
```

可执行文件将创建在 `dist` 目录中。

对于最终用户：
1. 下载适合你平台的可执行文件
2. 在可执行文件同目录下创建包含 osu! API 凭据的 `.env` 文件
3. （可选）创建 `config.json` 文件自定义搜索参数
4. （可选）修改 `mirrors.json` 自定义镜像站设置
5. 运行可执行文件 

## 致谢

特别感谢以下镜像站点提供者，是他们使得本工具成为可能：
- [Sayobot](https://osu.sayobot.cn/) - 提供稳定快速下载的中国 osu! 镜像站
- [Chimu](https://chimu.moe/) - 社区驱动的 osu! 镜像站，拥有庞大的谱面存档
- [Kitsu](https://kitsu.moe/) - 可靠的 osu! 镜像站，服务于社区
- [Nerina](https://nerina.pw/) - 专注于谱面分发的 osu! 镜像站

他们对 osu! 社区的贡献是无价的，让全世界的玩家都能更便捷地获取谱面。 