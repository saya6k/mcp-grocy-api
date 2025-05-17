# MCP Grocy API

[![npm version](https://img.shields.io/npm/v/mcp-grocy-api.svg)](https://www.npmjs.com/package/mcp-grocy-api)
[![Docker Image](https://img.shields.io/badge/docker%20image-ghcr.io-blue)](https://github.com/saya6k/mcp-grocy-api/pkgs/container/mcp-grocy-api)
[![License](https://img.shields.io/github/license/saya6k/mcp-grocy-api)](LICENSE)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-support-yellow.svg)](https://www.buymeacoffee.com/my7nmfcm92k)

This project is a specialized fork of [mcp-rest-api](https://github.com/dkmaker/mcp-rest-api), refactored to work specifically with Grocy's API.

## Installation

### NPM

```bash
git clone https://github.com/saya6k/mcp-grocy-api.git
cd mcp-grocy-api
npm install
npm audit fix
npm build
node ./build/index.js
```

### Docker

You should use [tini](https://github.com/krallin/tini) to init.
```bash
docker pull ghcr.io/saya6k/mcp-grocy-api:latest
docker run ghcr.io/saya6k/mcp-grocy-api:latest tini -- node build/index.js
```

See [installation.md](src/resources/installation.md) for more installation options and configuration instructions.

## Home Assistant Addon

For Home Assistant addon specific documentation, see [DOCS.md](DOCS.md).

## API Reference

For a complete list of all available API endpoints and examples, see [API Examples Documentation](./src/resources/examples.md).
