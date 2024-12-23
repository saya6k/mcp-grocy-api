# MCP REST API Tester
[![smithery badge](https://smithery.ai/badge/dkmaker-mcp-rest-api)](https://smithery.ai/server/dkmaker-mcp-rest-api)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![NPM Package](https://img.shields.io/npm/v/dkmaker-mcp-rest-api.svg)](https://www.npmjs.com/package/dkmaker-mcp-rest-api)

A TypeScript-based MCP server that enables testing of REST APIs through Cline. This tool allows you to test and interact with any REST API endpoints directly from your development environment.

<a href="https://glama.ai/mcp/servers/izr2sp4rqo">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/izr2sp4rqo/badge" />
</a>

## Installation

### Installing via Smithery

To install REST API Tester for Claude Desktop automatically via [Smithery](https://smithery.ai/server/dkmaker-mcp-rest-api):

```bash
npx -y @smithery/cli install dkmaker-mcp-rest-api --client claude
```

### Installing Manually
1. Install the package globally:
```bash
npm install -g dkmaker-mcp-rest-api
```

2. Add the server to your MCP configuration:

While these instructions are for Cline, the server should work with any MCP implementation. Configure based on your operating system:

### Windows
⚠️ **IMPORTANT**: Due to a known issue with Windows path resolution ([issue #40](https://github.com/modelcontextprotocol/servers/issues/40)), you must use the full path instead of %APPDATA%.

Add to `C:\Users\<YourUsername>\AppData\Roaming\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`:
```json
{
  "mcpServers": {
    "rest": {
      "command": "node",
      "args": [
        "C:/Users/<YourUsername>/AppData/Roaming/npm/node_modules/dkmaker-mcp-rest-api/build/index.js"
      ],
      "env": {
        "REST_BASE_URL": "https://api.example.com",
        // Basic Auth
        "AUTH_BASIC_USERNAME": "your-username",
        "AUTH_BASIC_PASSWORD": "your-password",
        // OR Bearer Token
        "AUTH_BEARER": "your-token",
        // OR API Key
        "AUTH_APIKEY_HEADER_NAME": "X-API-Key",
        "AUTH_APIKEY_VALUE": "your-api-key",
        // SSL Verification (enabled by default)
        "REST_ENABLE_SSL_VERIFY": "false" // Set to false to disable SSL verification for self-signed certificates
      }
    }
  }
}
```

### macOS
Add to `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`:
```json
{
  "mcpServers": {
    "rest": {
      "command": "npx",
      "args": [
        "-y",
        "dkmaker-mcp-rest-api"
      ],
      "env": {
        "REST_BASE_URL": "https://api.example.com",
        // Basic Auth
        "AUTH_BASIC_USERNAME": "your-username",
        "AUTH_BASIC_PASSWORD": "your-password",
        // OR Bearer Token
        "AUTH_BEARER": "your-token",
        // OR API Key
        "AUTH_APIKEY_HEADER_NAME": "X-API-Key",
        "AUTH_APIKEY_VALUE": "your-api-key",
        // SSL Verification (enabled by default)
        "REST_ENABLE_SSL_VERIFY": "false" // Set to false to disable SSL verification for self-signed certificates
      }
    }
  }
}
```

Note: Replace the environment variables with your actual values. Only configure one authentication method at a time:
1. Basic Authentication (username/password)
2. Bearer Token (if Basic Auth is not configured)
3. API Key (if neither Basic Auth nor Bearer Token is configured)

## Features

- Test REST API endpoints with different HTTP methods
- Support for GET, POST, PUT, and DELETE requests
- Detailed response information including status, headers, and body
- Custom header support
- Request body handling for POST/PUT methods
- SSL Certificate Verification:
  - Enabled by default for secure operation
  - Can be disabled for self-signed certificates or development environments
  - Control via REST_ENABLE_SSL_VERIFY environment variable
- Multiple authentication methods:
  - Basic Authentication (username/password)
  - Bearer Token Authentication
  - API Key Authentication (custom header)

## Usage

Once installed and configured, you can use the REST API Tester through Cline to test your API endpoints:

```typescript
// Test a GET endpoint
{
  "method": "GET",
  "endpoint": "/users"
}

// Test a POST endpoint with body
{
  "method": "POST",
  "endpoint": "/users",
  "body": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}

// Test with custom headers
{
  "method": "GET",
  "endpoint": "/products",
  "headers": {
    "Accept-Language": "en-US",
    "X-Custom-Header": "custom-value"
  }
}
```

## Development

1. Clone the repository:
```bash
git clone https://github.com/zenturacp/mcp-rest-api.git
cd mcp-rest-api
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

For development with auto-rebuild:
```bash
npm run watch
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
