# osu! Beatmap Downloader

[English](README.md) | [中文](README.zh.md)

A tool for downloading osu! beatmaps based on search criteria. You can specify conditions like star rating, mode, mapper, or even query to find and download the beatmaps you need.

## Features

- **Search and Download**
  - Filter by star rating, game mode, mapper, and more
  - Search beatmaps using keywords (song name, artist, etc.)
  - Find maps that match your criteria
  - Build practice map collections
- **Mirror Site Download**
  - Download from multiple mirror sites
  - Switch to alternative mirrors on failure
  - Configurable mirror priority
  - Supported mirrors:
    - sayobot.cn (Sayobot)
    - chimu.moe (Chimu)
    - kitsu.moe (Kitsu)
    - nerina.pw (Nerina)
- **Download Features**
  - Batch downloading with progress tracking
  - Retry on failures
  - File integrity checks
  - Configurable parameters
- Uses osu! API v2 for searching

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

The tool uses two configuration files:

1. `config.json` - Main configuration file:
   - Search conditions
     - Difficulty rating range
     - Game mode
     - Mapper name
     - Keywords (song name, artist, tags)
   - Download directory
   - Other download options

2. `mirrors.json` - Mirror site configuration:
   - Mirror site URLs and priorities
   - Download parameters
   - Request headers
   - Timeout settings

You can customize these files to match your preferences.

## Usage

Run the program:
```bash
npm start
```

## How it Works

1. Uses osu! API v2 to search for beatmaps matching your criteria
2. Downloads found beatmaps using configured mirror sites
3. Automatically tries different mirrors if one fails
4. Verifies downloaded files for integrity

## Notes

- Ensure you have enough disk space
- Comply with osu! API usage guidelines
- Downloaded beatmaps will be saved in the `downloads` directory
- The tool now uses mirror sites for downloading, which is more reliable than direct downloads
- You can configure mirror priorities in `mirrors.json`

## Dependencies

- axios: For sending HTTP requests
- progress: For displaying download progress
- dotenv: For environment variable management

## Build

To build the executable:

```bash
# Build for your current platform
npm run build

# Build for specific platforms
npm run build:win   # Windows
npm run build:mac   # macOS
npm run build:linux # Linux
```

The executables will be created in the `dist` directory.

For end users:
1. Download the executable for your platform
2. Create a `.env` file in the same directory as the executable with your osu! API credentials
3. (Optional) Create a `config.json` file to customize search parameters
4. (Optional) Modify `mirrors.json` to customize mirror site settings
5. Run the executable

## Acknowledgments

Special thanks to the following mirror site providers who make this tool possible:
- [Sayobot](https://osu.sayobot.cn/) - A Chinese osu! mirror site providing stable and fast downloads
- [Chimu](https://chimu.moe/) - A community-driven osu! mirror with extensive beatmap archive
- [Kitsu](https://kitsu.moe/) - A reliable osu! mirror site serving the community
- [Nerina](https://nerina.pw/) - A dedicated osu! mirror helping with beatmap distribution

Their contributions to the osu! community are invaluable, making it easier for players worldwide to access beatmaps.

