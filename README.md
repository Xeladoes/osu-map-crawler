# osu! Beatmap Downloader

[English](README.md) | [中文](README.zh.md)

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

