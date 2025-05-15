# MCP Grocy API
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A TypeScript-based MCP server that enables interaction with Grocy's API. This tool allows you to manage your Grocy inventory, shopping lists, and more directly from your AI assistant.

## About Grocy

[Grocy](https://grocy.info/) is a self-hosted groceries & household management solution for your home. This MCP server enables AI assistants to interact with your Grocy instance, allowing you to query stock levels, product information, manage shopping lists, and more.

## Installation

### Installing Manually
1. Install the package globally:
```bash
npm install -g mcp-grocy-api
```

2. Configure your environment variables:
Create a `.env` file with your Grocy configuration:

```
GROCY_URL=https://your-grocy-instance.example.com
GROCY_API_KEY=your-api-key-here
GROCY_PORT=443
GROCY_IGNORE_SSL=False
```

3. Configure your AI assistant's custom instructions:

Add the following to your AI assistant's custom instructions:

```markdown
# Grocy API Integration for AI Assistants

The `grocy-api` MCP server provides tools to interact with a Grocy inventory management system directly from an AI assistant.

## Available Tools

- `get_stock`: Get current stock information from your Grocy instance
- `get_products`: Get product information with optional filtering
- `get_product_by_id`: Get detailed information about a specific product
- `get_locations`: Get all storage locations from your Grocy instance
- `get_shopping_list`: Get your current shopping list items
- `call_grocy_api`: Make custom API calls to your Grocy instance

## When to Use

- Check current stock levels of items
- Query product information
- View product details by ID
- List storage locations
- Manage shopping lists
- Access any Grocy API endpoint for advanced operations

## Example Usage

To get current stock:
```
use_mcp_tool('grocy-api', 'get_stock', {})
```

To find products matching a search term:
```
use_mcp_tool('grocy-api', 'get_products', {"query": "pasta"})
```

## Resources

The following resources provide detailed documentation:

- examples: Usage examples for all tools
- response-format: Response structure details
- config: Configuration options and setup guide
```

3. Add the server to your MCP configuration:

Configure based on your operating system:

### MacOS and Linux
Add to your configuration file:

```json
{
  "mcpServers": {
    "grocy-api": {
      "command": "node",
      "args": [
        "/usr/local/lib/node_modules/mcp-grocy-api/build/index.js"
      ],
      "env": {
        "GROCY_URL": "https://your-grocy-instance.example.com",
        "GROCY_API_KEY": "your-api-key-here",
        "GROCY_PORT": "443",
        "GROCY_IGNORE_SSL": "False"
      }
    }
  }
}
```

### Windows
Add to your configuration file:

```json
{
  "mcpServers": {
    "grocy-api": {
      "command": "node",
      "args": [
        "C:/Users/<YourUsername>/AppData/Roaming/npm/node_modules/mcp-grocy-api/build/index.js"
      ],
      "env": {
        "GROCY_URL": "https://your-grocy-instance.example.com",
        "GROCY_API_KEY": "your-api-key-here",
        "GROCY_PORT": "443",
        "GROCY_IGNORE_SSL": "False"
      }
    }
  }
}```
}
```

## Features

- Direct integration with Grocy's API for inventory management
- Specialized tools for common Grocy operations:
  - Get current stock information
  - Search and retrieve product information
  - Get product details by ID
  - List storage locations
  - View shopping lists
- Advanced custom API access with the `call_grocy_api` tool
- Detailed response information for debugging
- Automatic handling of API authentication
- Support for self-signed certificates with SSL verification toggle
- Response size management to handle large data responses

## Usage Examples

Once installed and configured, you can use the Grocy API through your AI assistant to manage your inventory:

### Get Current Stock Levels

```
I'd like to see what's in my inventory currently.
```

Sample response:
```json
[
  {
    "product_id": 1,
    "product_name": "Cookies",
    "amount": 12,
    "best_before_date": "2025-11-10",
    "location": 4,
    "amount_opened": 0,
    "value": 33.96
  },
  {
    "product_id": 2,
    "product_name": "Chocolate",
    "amount": 13,
    "best_before_date": "2025-11-10",
    "location": 4,
    "amount_opened": 0,
    "value": 30.99
  }
]
```

### Finding Products

```
Can you find all products with "chocolate" in the name?
```

Sample response:
```json
[
  {
    "id": 2,
    "name": "Chocolate",
    "description": null,
    "product_group_id": 1,
    "active": 1,
    "location_id": 4,
    "min_stock_amount": 8
  },
  {
    "id": 24,
    "name": "Milk Chocolate",
    "description": null,
    "product_group_id": 1,
    "active": 1,
    "location_id": 4,
    "min_stock_amount": 0
  },
  {
    "id": 25,
    "name": "Dark Chocolate",
    "description": null,
    "product_group_id": 1,
    "active": 1,
    "location_id": 4,
    "min_stock_amount": 0
  }
]
```

### Getting Product Details

```
Can you show me details about product ID 3?
```

Sample response:
```json
{
  "id": 3,
  "name": "Gummy bears",
  "description": null,
  "product_group_id": 1,
  "active": 1,
  "location_id": 4,
  "shopping_location_id": null,
  "qu_id_purchase": 3,
  "qu_id_stock": 3,
  "min_stock_amount": 8,
  "default_best_before_days": 0
}
```

## Development

### Building from Source
```bash
# Clone the repository
git clone https://github.com/yourusername/mcp-grocy-api.git
cd mcp-grocy-api

# Install dependencies
npm install

# Build the project
npm run build

# Install globally
npm install -g .
```

### Environment Variables
Create a `.env` file in the project root with the required variables:

```
GROCY_URL=https://your-grocy-instance.example.com
GROCY_API_KEY=your-api-key-here
GROCY_PORT=443
GROCY_IGNORE_SSL=False
GROCY_RESPONSE_SIZE_LIMIT=10000
```

## License

MIT

## Acknowledgements

- [Grocy](https://grocy.info/) - The self-hosted groceries & household management solution
- [Model Context Protocol](https://modelcontextprotocol.ai/) - For providing the framework for AI assistants to interact with tools
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
