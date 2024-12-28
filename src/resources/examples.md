# REST API Testing Examples

## Basic GET Request
```typescript
{
  "method": "GET",
  "endpoint": "/users"
}
```

## GET with Query Parameters
```typescript
{
  "method": "GET",
  "endpoint": "/users?role=admin&status=active"
}
```

## POST Request with Body
```typescript
{
  "method": "POST",
  "endpoint": "/users",
  "body": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

## Request with Custom Headers
```typescript
{
  "method": "GET",
  "endpoint": "/secure-resource",
  "headers": {
    "Custom-Header": "value",
    "Another-Header": "another-value"
  }
}
```

## PUT Request Example
```typescript
{
  "method": "PUT",
  "endpoint": "/users/123",
  "body": {
    "name": "Updated Name",
    "status": "inactive"
  }
}
```

## DELETE Request Example
```typescript
{
  "method": "DELETE",
  "endpoint": "/users/123"
}
