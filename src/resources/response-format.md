# Grocy API Response Format Documentation

The Grocy API MCP server returns structured responses for easier interaction with your Grocy instance. This document explains the response structure.

## Standard Response Format

When using the `call_grocy_api` tool, you receive the complete response object with details:

```json
{
  "request": {
    "url": "https://your-grocy-instance.com/api/stock",
    "method": "GET",
    "headers": {
      "GROCY-API-KEY": "[REDACTED]",
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    "body": null
  },
  "response": {
    "statusCode": 200,
    "statusText": "OK",
    "timing": "345ms",
    "headers": {
      "content-type": "application/json",
      "cache-control": "no-cache, private"
    },
    "body": [
      {
        "product_id": 1,
        "amount": 12,
        "best_before_date": "2025-11-10",
        "product": {
          "name": "Cookies",
          "id": 1
          // other product properties
        }
      }
      // more items...
    ]
  },
  "validation": {
    "isError": false,
    "messages": ["Request completed successfully"]
  }
}
```

## Specialized Tool Responses

The specialized tools (`get_stock`, `get_products`, etc.) return simplified responses that contain just the relevant data. For example:

```json
[
  {
    "id": 1,
    "name": "Cookies",
    "description": null,
    "product_group_id": 1,
    "active": 1,
    "location_id": 4,
    "shopping_location_id": null,
    "min_stock_amount": 8
    // other product properties
  },
  // more products...
]
```

## Response Size Limits

If a response exceeds the configured size limit (default: 10KB), it will be truncated, and the response will include information about the truncation:

```json
{
  "validation": {
    "isError": false,
    "messages": [
      "Request completed successfully",
      "Response truncated: 10000 of 25000 bytes returned due to size limit (10000 bytes)"
    ],
    "truncated": {
      "originalSize": 25000,
      "returnedSize": 10000,
      "truncationPoint": 10000,
      "sizeLimit": 10000
    }
  }
}
```

## Error Responses

When an error occurs, the response will include error details:

```json
{
  "error": {
    "message": "Request failed with status 404",
    "code": 404,
    "response": {
      "error_message": "Not found."
    }
  }
}
```

For network-related errors:

```json
{
  "error": {
    "message": "getaddrinfo ENOTFOUND your-grocy-instance.com",
    "code": "ENOTFOUND"
  }
}
```
