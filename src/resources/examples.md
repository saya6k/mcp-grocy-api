# REST API Testing Examples

## Basic GET Request
```typescript
use_mcp_tool('rest-api', 'test_request', {
  "method": "GET",
  "endpoint": "/users"
});
```

## GET with Query Parameters
```typescript
use_mcp_tool('rest-api', 'test_request', {
  "method": "GET",
  "endpoint": "/users?role=admin&status=active"
});
```

## POST Request with Body
```typescript
use_mcp_tool('rest-api', 'test_request', {
  "method": "POST",
  "endpoint": "/users",
  "body": {
    "name": "John Doe",
    "email": "john@example.com"
  }
});
```

## Request with Custom Headers
```typescript
use_mcp_tool('rest-api', 'test_request', {
  "method": "GET",
  "endpoint": "/secure-resource",
  "headers": {
    "Custom-Header": "value",
    "Another-Header": "another-value"
  }
});
```

## PUT Request Example
```typescript
use_mcp_tool('rest-api', 'test_request', {
  "method": "PUT",
  "endpoint": "/users/123",
  "body": {
    "name": "Updated Name",
    "status": "inactive"
  }
});
```

## DELETE Request Example
```typescript
use_mcp_tool('rest-api', 'test_request', {
  "method": "DELETE",
  "endpoint": "/users/123"
});
