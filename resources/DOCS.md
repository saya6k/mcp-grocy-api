# MCP Grocy API - Home Assistant Addon

This addon allows you to run MCP Grocy API in your Home Assistant instance, providing an API for connecting Grocy inventory management to other systems.

## Installation

1. Add this repository to your Home Assistant addon store: 
   [![Open your Home Assistant instance and show the add add-on repository dialog with a specific repository URL pre-filled.](https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg)](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https://github.com/saya6k/hassio-addons)

2. Find the "MCP Grocy API" addon and click Install.

## Configuration

### Addon Configuration

```yaml
grocy_base_url: http://a0d7b954-grocy:80
grocy_api_key: your_api_key_here
ssl_verify: false
response_size_limit: 10000
```

### Option: `grocy_base_url` (required)
- The URL to your Grocy instance.
- Example: `https://grocy.example.com`

### Option: `grocy_api_key` (required)
- Your Grocy API key.
- You can find this in your Grocy settings.

### Option: `ssl_verify` (optional)
- Set to `false` to disable SSL verification (useful for self-signed certificates).
- Default: `true`

### Option: `response_size_limit` (optional)
- Maximum size of API responses.
- Default: `10000`

## Communication

This addon communicates with Home Assistant via standard input/output (stdio) and does not expose any ports. It is designed to be used as a backend service without direct network access.

## Support

If you have any issues or questions, please file an issue on the GitHub repository.