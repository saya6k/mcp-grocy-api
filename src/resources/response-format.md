# Grocy API Response Format Documentation

The Grocy API testing tool (`test_request`) returns a comprehensive JSON response containing request details, response information, and validation results. Other specialized Grocy tools (e.g., `get_stock`, `add_shopping_list_item`) return the direct JSON response from the Grocy API, which is then stringified.

## `test_request` Tool Response Structure

```json
{
  "request": {
    "url": "https://demo.grocy.info/api/objects/products/1",
    "method": "GET",
    "headers": {
      "GROCY-API-KEY": "[REDACTED]",
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    "body": null,
    "authMethod": "apikey"
  },
  "response": {
    "statusCode": 200,
    "statusText": "OK",
    "timing": "123ms",
    "headers": {
      "content-type": "application/json; charset=utf-8",
      "date": "Mon, 01 Jul 2024 12:00:00 GMT"
    },
    "body": {
      "id": "1",
      "name": "Cookies",
      "description": null,
      "product_group_id": "1",
      // ... other product fields ...
    }
  },
  "validation": {
    "isError": false,
    "messages": ["Request completed successfully"]
  }
}
```

## Response Fields for `test_request`

### Request Details (`request`)
- `url`: Full URL of the Grocy API endpoint called, including base URL and path.
- `method`: HTTP method used (e.g., GET, POST, PUT, DELETE).
- `headers`: Request headers sent to the Grocy API. Sensitive headers like `GROCY-API-KEY` will have their values redacted.
- `body`: Request body sent (if applicable, e.g., for POST/PUT requests).
- `authMethod`: Authentication method used. For Grocy, this will typically be `apikey` if `GROCY_APIKEY_VALUE` is configured, or `none`.

### Response Details (`response`)
- `statusCode`: HTTP status code returned by the Grocy API (e.g., 200, 400, 401).
- `statusText`: HTTP status message (e.g., "OK", "Bad Request").
- `timing`: Duration of the API request in milliseconds.
- `headers`: Response headers received from the Grocy API.
- `body`: Response body content from the Grocy API. This will be the JSON data returned by Grocy.

### Validation (`validation`)
- `isError`: Boolean, `true` if the HTTP status code is 400 or higher, indicating an error.
- `messages`: Array of messages, including success messages or error details.
- `truncated` (optional): If the response body exceeds `REST_RESPONSE_SIZE_LIMIT`, this object will contain details about the truncation.
  - `originalSize`: The original size of the response body in bytes.
  - `returnedSize`: The size of the truncated response body returned.
  - `truncationPoint`: The byte offset where truncation occurred.
  - `sizeLimit`: The configured `REST_RESPONSE_SIZE_LIMIT`.

## Specialized Grocy Tools Response Format

Tools like `get_stock`, `get_products`, `add_shopping_list_item`, etc., directly return the JSON response from the Grocy API, stringified within the MCP tool response content.

Example for `get_product` (if it existed as a specialized tool for a single product):
```json
{
  "content": [
    {
      "type": "text",
      "text": "{\n  \"id\": \"1\",\n  \"name\": \"Cookies\",\n  \"description\": null,\n  \"product_group_id\": \"1\",\n  \"qu_id_purchase\": \"2\",\n  \"qu_id_stock\": \"2\",\n  \"qu_factor_purchase_to_stock\": \"1.0\",\n  \"barcode\": null,\n  \"min_stock_amount\": \"0\",\n  \"default_best_before_days\": \"0\",\n  \"default_best_before_days_after_open\": \"0\",\n  \"default_best_before_days_after_freezing\": \"0\",\n  \"default_best_before_days_after_thawing\": \"0\",\n  \"picture_file_name\": null,\n  \"allow_partial_units_in_stock\": \"0\",\n  \"row_created_timestamp\": \"2023-01-01 10:00:00\",\n  \"show_in_recipes_list\": \"1\",\n  \"has_sub_products\": \"0\",\n  \"active\": \"1\",\n  \"calories\": null,\n  \"cumulate_min_stock_amount_of_sub_products\": \"0\",\n  \"due_type\": \"1\",\n  \"quick_consume_amount\": \"1.0\",\n  \"hide_on_stock_overview\": \"0\",\n  \"default_stock_label_type\": \"0\",\n  \"should_not_be_frozen\": \"0\",\n  \"treat_opened_as_out_of_stock\": \"1\",
  \"no_own_stock\": \"0\",
  \"default_consume_location_id\": null,
  \"move_on_open\": \"0\",
  \"userfields\": null
}"
    }
  ]
}
```

If an error occurs with a specialized tool, the response will typically look like:
```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"error\": \"Failed to get stock: API error (401) Unauthorized - Please check your API key and permissions.\"}"
    }
  ],
  "isError": true
}
```

## Error Response Example for `test_request`

If the `test_request` tool encounters an API error (e.g., authentication failure):
```json
{
  "request": {
    "url": "https://demo.grocy.info/api/objects/products",
    "method": "GET",
    "headers": {
      "GROCY-API-KEY": "[REDACTED]"
    },
    "body": null,
    "authMethod": "apikey"
  },
  "response": {
    "statusCode": 401,
    "statusText": "Unauthorized",
    "timing": "50ms",
    "headers": { /* ... headers ... */ },
    "body": {
      "error_message": "API key is missing or invalid."
    }
  },
  "validation": {
    "isError": true,
    "messages": [
      "Request failed with status 401",
      "API key is missing or invalid."
    ]
  }
}
```
