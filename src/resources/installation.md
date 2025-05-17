# Installation

Instructions on how to install this project.

## Claude

Edit `claude_desktop_config.json`(for Claude Desktop) or `.cursor/mcp.json`(for Cursor):

```json
{
  "mcpServers": {
    "mcp-grocy-api": {
      "command": "npx",
      "args": [
        "-y",
        "saya6k/mcp-grocy-api"
      ], 
      "env": {
        "GROCY_BASE_URL": "",
        "GROCY_APIKEY_VALUE": "",
        "GROCY_ENABLE_SSL_VERIFY": "False",
        "REST_RESPONSE_SIZE_LIMIT": "10000"
      }
    }
  }
}
```
Or you can use Docker:
```json
{
  "mcpServers": {
    "mcp-grocy-api": {
      "command": "docker",
      "args": [
        "run",
        "ghcr.io/saya6k/mcp-grocy-api",
        "tini",
        "--",
        "node",
        "build/index.js"
        ],
      "env": {
        "GROCY_BASE_URL": "",
        "GROCY_APIKEY_VALUE": "",
        "GROCY_ENABLE_SSL_VERIFY": "False",
        "REST_RESPONSE_SIZE_LIMIT": "10000"
      }
    }
  }
}
```

## Node.js

To install using Node.js, you will need to have Node.js and npm (or yarn) installed.

Clone the repository:
```bash
git clone https://github.com/saya6k/mcp-grocy-api.git
cd mcp-grocy-api
```

Install dependencies:
```bash
npm install
# or
yarn install
```

Then you can run the server:
```bash
npm start
# or
yarn start
```

## npx

You can also run the server directly using npx (Node.js 12.x or newer):

```bash
npx -y mcp-grocy-api
```

## Docker

To run using Docker, you first need to build the Docker image:

```bash
docker build -t ghcr.io/saya6k/mcp-grocy-api .
```

Then run the container with tini:

```bash
docker run -p mcp-grocy-api tini -- node build/index.js
```