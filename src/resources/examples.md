# REST API Testing Examples

⚠️ IMPORTANT: Only provide the endpoint path - do not include full URLs. Your path will be automatically resolved to the full URL.

For example, if the base URL is `http://localhost:3000`:
✅ Correct: `"/api/users"` → Resolves to: `http://localhost:3000/api/users`
❌ Incorrect: `"http://localhost:3000/api/users"` or `"www.example.com/api/users"`

## Basic GET Request
```typescript
use_mcp_tool('rest-api', 'test_request', {
  "method": "GET",
  "endpoint": "/users"  // Will be appended to REST_BASE_URL
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
```

## Changing Base URL
If you need to test against a different base URL, update the base URL configuration rather than including the full URL in the endpoint parameter.

Example:
```bash
# Instead of this:
❌ "endpoint": "https://api.example.com/users"  # Wrong - don't include the full URL

# Do this:
# 1. Update the base URL configuration to: https://api.example.com
# 2. Then use just the path:
✅ "endpoint": "/users"  # This will resolve to: https://api.example.com/users
