# Response Format Documentation

The REST API testing tool returns a comprehensive JSON response containing request details, response information, and validation results.

## Response Structure

```json
{
  "request": {
    "url": "http://api.example.com/users",
    "method": "GET",
    "headers": {},
    "body": null,
    "authMethod": "none"
  },
  "response": {
    "statusCode": 200,
    "statusText": "OK",
    "timing": "123ms",
    "headers": {},
    "body": {}
  },
  "validation": {
    "isError": false,
    "messages": ["Request completed successfully"]
  }
}
```

## Response Fields

### Request Details
- `url`: Full URL including base URL and endpoint
- `method`: HTTP method used
- `headers`: Request headers sent
- `body`: Request body (if applicable)
- `authMethod`: Authentication method used (none, basic, bearer, or apikey)

### Response Details
- `statusCode`: HTTP status code
- `statusText`: Status message
- `timing`: Request duration in milliseconds
- `headers`: Response headers received
- `body`: Response body content

### Validation
- `isError`: true if status code >= 400
- `messages`: Array of validation or error messages

## Error Response Example

```json
{
  "error": {
    "message": "Connection refused",
    "code": "ECONNREFUSED",
    "request": {
      "url": "http://api.example.com/users",
      "method": "GET",
      "headers": {},
      "body": null
    }
  }
}
