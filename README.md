# MCP Grocy API

> [!WARNING]
> **This project is no longer maintained.**
>
> The maintainer no longer uses Grocy and cannot review issues, accept PRs,
> or ship updates. This repository has been archived as of 2026-05-27.
> If you'd like to continue development, please fork and maintain your own
> version, or look for an active community fork.

[![npm version](https://img.shields.io/npm/v/mcp-grocy-api.svg)](https://www.npmjs.com/package/mcp-grocy-api)
[![Docker Image](https://img.shields.io/badge/docker%20image-ghcr.io-blue)](https://github.com/saya6k/mcp-grocy-api/pkgs/container/mcp-grocy-api)
[![License](https://img.shields.io/github/license/saya6k/mcp-grocy-api)](LICENSE)
[![Configuration Status](https://github.com/saya6k/mcp-grocy-api/actions/workflows/validate-config.yml/badge.svg)](https://github.com/saya6k/mcp-grocy-api/actions/workflows/validate-config.yml)
[![CI/CD Pipeline](https://github.com/saya6k/mcp-grocy-api/actions/workflows/pipeline.yml/badge.svg)](https://github.com/saya6k/mcp-grocy-api/actions/workflows/pipeline.yml)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue)](https://modelcontextprotocol.io)

This project is a specialized fork of [mcp-rest-api](https://github.com/dkmaker/mcp-rest-api), refactored to work specifically with Grocy's API.

## Installation

### NPM

```bash
git clone -b main https://github.com/saya6k/mcp-grocy-api.git
cd mcp-grocy-api
npm install
npm run build
```

### Docker

```bash
docker run -e GROCY_APIKEY_VALUE=your_api_key -e GROCY_BASE_URL=http://your-grocy-instance ghcr.io/saya6k/mcp-grocy-api:latest
```

### Home Assistant Add-on

[![Open your Home Assistant instance and show the add add-on repository dialog with a specific repository URL pre-filled.](https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg)](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https%3A%2F%2Fgithub.com%2Fsaya6k%2Fhassio-addons)

The MCP Grocy API is available as a Home Assistant add-on through [saya6k's add-on repository](https://github.com/saya6k/hassio-addons).

## Usage

To use the API, you need to provide the Grocy API URL and API key:

```bash
# Start the server with environment variables
npx cross-env GROCY_BASE_URL=http://your-grocy-instance GROCY_APIKEY_VALUE=your_api_key mcp-grocy-api
```

Or to start in development mode:

```bash
# Start the server with sample/mock responses (no real Grocy instance needed)
npx cross-env GROCY_BASE_URL=http://your-grocy-instance GROCY_APIKEY_VALUE=your_api_key mcp-grocy-api --mock
```

### Environment Variables

- `GROCY_BASE_URL`: Your Grocy API URL
- `GROCY_APIKEY_VALUE`: Your Grocy API key
- `GROCY_ENABLE_SSL_VERIFY`: Whether to verify SSL certificate
- `REST_RESPONSE_SIZE_LIMIT`: REST API response size  (default: 10000 = 10KB)

## Documentation

### API Reference

For the full API reference, see the [API Reference](src/resources/api-reference.md).

### Configuration

For configuration options, see the [Configuration Guide](src/resources/config.md).

## Development

### Prerequisites

- Node.js 18 or higher
- Grocy instance (or use `--mock` for development)

### Testing

```bash
npm test
```

## License

This project is licensed under the [MIT License](LICENSE).