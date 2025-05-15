# Grocy API Configuration

This document describes all available configuration options for the Grocy API MCP server.

## Core Configuration

### GROCY_URL (Required)
- Description: The base URL for your Grocy instance
- Example: `https://my-grocy-instance.example.com` or `https://test-q088pt14kicsoow7ihiluh.demo.grocy.info`
- Usage: All API endpoint paths will be appended to this URL

### GROCY_API_KEY (Required)
- Description: Your Grocy API key for authentication
- Example: `qSmP6NG2iEyUBumCcWHeF2lwkuFBNKng9OnnCmWlheKz8RqVsv`
- Usage: This key is sent with each request to authenticate with your Grocy instance

### GROCY_PORT (Optional)
- Description: Port number for your Grocy instance
- Default: `443`
- Example: `8192` for a custom port
- Usage: Helps ensure proper connection when your Grocy instance uses a non-standard port

### GROCY_IGNORE_SSL (Optional)
- Description: Controls SSL certificate verification
- Default: `False`
- Values: Set to `True` to disable SSL verification for self-signed certificates
- Usage: Disable when using self-signed certificates in development environments

### GROCY_RESPONSE_SIZE_LIMIT (Optional)
- Description: Maximum size in bytes for response data
- Default: 10000 (10KB)
- Example: `50000` for 50KB limit
- Usage: Helps prevent memory issues with large responses. If a response exceeds this size, it will be truncated and a warning message will be included

## Configuration Examples

### Demo Grocy Instance
```bash
GROCY_URL=https://test-q088pt14kicsoow7ihiluh.demo.grocy.info
GROCY_API_KEY=qSmP6NG2iEyUBumCcWHeF2lwkuFBNKng9OnnCmWlheKz8RqVsv
GROCY_PORT=443
GROCY_IGNORE_SSL=False
```

### Self-hosted Grocy with SSL disabled
```bash
GROCY_URL=https://grocy.home.local
GROCY_API_KEY=your-api-key-here
GROCY_PORT=8192
GROCY_IGNORE_SSL=True
GROCY_RESPONSE_SIZE_LIMIT=50000
```

## Changing Configuration

Configuration can be updated by:
1. Setting environment variables before starting the server
2. Creating a `.env` file in the project root directory
3. Updating your environment configuration in VS Code
2. Modifying the MCP server configuration file
3. Using environment variable commands in your terminal

Remember to restart the server after changing configuration for the changes to take effect.
