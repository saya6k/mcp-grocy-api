# Grocy API Usage Examples

This document provides examples of using the MCP Grocy API tool to interact with your Grocy instance.

## Working with Stock

### Get All Stock Items
```typescript
use_mcp_tool('grocy-api', 'get_stock', {});
```

### Get Stock with Full Details
```typescript
use_mcp_tool('grocy-api', 'get_stock', {
  "includeDetails": true
});
```

## Working with Products

### Get All Products
```typescript
use_mcp_tool('grocy-api', 'get_products', {});
```

### Search Products by Name
```typescript
use_mcp_tool('grocy-api', 'get_products', {
  "query": "Chocolate"
});
```

### Get Product Details by ID
```typescript
use_mcp_tool('grocy-api', 'get_product_by_id', {
  "productId": 2  // ID of the product to retrieve details for
});
```

## Locations and Shopping Lists

### Get All Storage Locations
```typescript
use_mcp_tool('grocy-api', 'get_locations', {});
```

### Get Shopping List Items
```typescript
use_mcp_tool('grocy-api', 'get_shopping_list', {});
```

## Advanced Usage: Custom API Calls

For more specific needs, you can use the `call_grocy_api` tool to make custom API calls to your Grocy instance.

### GET Request Examples

#### Get Quantity Units
```typescript
use_mcp_tool('grocy-api', 'call_grocy_api', {
  "endpoint": "/api/objects/quantity_units"
});
```

#### Get Product Groups
```typescript
use_mcp_tool('grocy-api', 'call_grocy_api', {
  "endpoint": "/api/objects/product_groups"
});
```

### POST Request Example: Add Product to Shopping List
```typescript
use_mcp_tool('grocy-api', 'call_grocy_api', {
  "method": "POST",
  "endpoint": "/api/objects/shopping_list",
  "body": {
    "product_id": 3,
    "amount": 2,
    "shopping_list_id": 1
  }
});
```

### PUT Request Example: Update Product Details
```typescript
use_mcp_tool('grocy-api', 'call_grocy_api', {
  "method": "PUT",
  "endpoint": "/api/objects/products/3",
  "body": {
    "min_stock_amount": 5
  }
});
```

### Using Query Parameters
```typescript
use_mcp_tool('grocy-api', 'call_grocy_api', {
  "endpoint": "/api/stock/products/by-barcode",
  "params": {
    "barcode": "123456789"
  }
});
```

## Response Format

All responses include detailed information about the request and response, including:
- Full URL called
- HTTP method used
- Request headers and body
- Response status code
- Response headers and body
- Response timing
- Validation information
