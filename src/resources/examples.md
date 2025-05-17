# Grocy API Testing Examples

## Setting Up Your Private Demo Instance

Before testing the API, you can create your own private Grocy demo instance:

1. Visit [https://demo.grocy.info](https://demo.grocy.info).
2. Look for "Create a private demo instance" section
3. Create your personal instance which will remain available for testing
4. Use the provided API key and URL in your `.env` file:
   ```
   GROCY_BASE_URL=https://your-name-xxxxx.demo.grocy.info
   GROCY_APIKEY_VALUE=your-private-api-key
   ```

⚠️ IMPORTANT: Only provide the endpoint path - do not include full URLs. Your path will be automatically resolved to the full URL.

For example, if the base URL is `https://your-own-demo.grocy.info`:
✅ Correct: `"/api/objects/products"` → Resolves to: `https://your-own-demo.grocy.info/api/objects/products`
❌ Incorrect: `"https://your-own-demo.grocy.info/api/objects/products"` or `"www.grocy.example.com/api/objects/products"`

## Basic API Tools

### Get Current Stock
```typescript
use_mcp_tool('grocy-api', 'get_stock', {});
```

### Get Volatile Stock Information
```typescript
use_mcp_tool('grocy-api', 'get_stock_volatile', {
  "includeDetails": true
});
```

### Get All Products
```typescript
use_mcp_tool('grocy-api', 'get_products', {});
```

### Get All Shopping List Items
```typescript
use_mcp_tool('grocy-api', 'get_shopping_list', {});
```

### Add Item to Shopping List
```typescript
use_mcp_tool('grocy-api', 'add_shopping_list_item', {
  "productId": 1,
  "amount": 2,
  "shoppingListId": 1,
  "note": "Get the organic variety"
});
```

### Purchase a Product
```typescript
use_mcp_tool('grocy-api', 'purchase_product', {
  "productId": 1,
  "amount": 2,
  "bestBeforeDate": "2024-12-31",
  "price": 3.99,
  "storeId": 1
});
```

### Consume a Product
```typescript
use_mcp_tool('grocy-api', 'consume_product', {
  "productId": 1,
  "amount": 1,
  "spoiled": false
});
```

## Recipe and Meal Planning

### Get All Recipes
```typescript
use_mcp_tool('grocy-api', 'get_recipes', {});
```

### Check Recipe Fulfillment
```typescript
use_mcp_tool('grocy-api', 'get_recipe_fulfillment', {
  "recipeId": 1,
  "servings": 2
});
```

### Add Recipe to Meal Plan
```typescript
use_mcp_tool('grocy-api', 'add_recipe_to_meal_plan', {
  "recipeId": 1,
  "day": "2024-07-01",
  "servings": 2
});
```

### Consume Recipe Ingredients
```typescript
use_mcp_tool('grocy-api', 'consume_recipe', {
  "recipeId": 1,
  "servings": 2
});
```

## Chores and Tasks

### Get All Chores
```typescript
use_mcp_tool('grocy-api', 'get_chores', {});
```

### Track Chore Execution
```typescript
use_mcp_tool('grocy-api', 'track_chore_execution', {
  "choreId": 1,
  "executedBy": 1,
  "tracked_time": "2024-06-30 15:30:00"
});
```

### Get All Tasks
```typescript
use_mcp_tool('grocy-api', 'get_tasks', {});
```

### Complete a Task
```typescript
use_mcp_tool('grocy-api', 'complete_task', {
  "taskId": 1,
  "note": "Task completed successfully"
});
```

## Locations and Organization

### Get All Locations
```typescript
use_mcp_tool('grocy-api', 'get_locations', {});
```

### Get All Shopping Locations (Stores)
```typescript
use_mcp_tool('grocy-api', 'get_shopping_locations', {});
```

### Transfer Product Between Locations
```typescript
use_mcp_tool('grocy-api', 'transfer_product', {
  "productId": 1,
  "amount": 1,
  "locationIdFrom": 1,
  "locationIdTo": 2,
  "note": "Moving to kitchen"
});
```

## Advanced API Usage

### Custom API Call
If you need to access a Grocy API endpoint not covered by the specialized tools:

```typescript
use_mcp_tool('grocy-api', 'call_grocy_api', {
  "endpoint": "objects/product_barcodes",
  "method": "GET"
});
```

### Raw API Testing
For detailed testing with full control over the request:

```typescript
use_mcp_tool('grocy-api', 'test_request', {
  "method": "GET",
  "endpoint": "/api/stock/products/by-barcode/1234567890",
  "headers": {
    "Accept-Language": "en-US"
  }
});
```

# MCP Grocy API - Endpoint Reference

This document provides a comprehensive reference of all available endpoints in the MCP Grocy API.

## Recipes

### GET `/api/grocy/recipes`
Retrieves a list of all recipes.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Pizza",
    "description": "Homemade pizza recipe"
  }
]
```

### GET `/api/grocy/recipes/:recipeId`
Retrieves details of a specific recipe by ID.

**Parameters:**
- `recipeId`: ID of the recipe to retrieve

**Response:**
```json
{
  "id": 1,
  "name": "Pizza",
  "description": "Homemade pizza recipe",
  "base_servings": 4,
  "desired_servings": 4,
  "preparation": "Mix ingredients and bake at 450°F"
}

### Get Recipe Fulfillment
- **GET** `/api/grocy/recipes/:recipeId/fulfillment`
- Returns fulfillment information for a specific recipe including:
  - Whether ingredients are in stock
  - Missing products count
  - Costs
  - Calories
  - Due score

### Get All Recipes Fulfillment
- **GET** `/api/grocy/recipes-fulfillment`
- Returns fulfillment information for all recipes including:
  - Recipe ID
  - Fulfillment status
  - Missing products count
  - Costs

### Add Not Fulfilled Products to Shopping List
- **POST** `/api/grocy/recipes/:recipeId/add-not-fulfilled-products-to-shoppinglist`
- Adds all missing ingredients for a recipe to the shopping list
- Returns the result of the operation

## Stock

### Get All Stock
- **GET** `/api/grocy/stock`
- Returns a list of all stock items

### Get Stock Item by ID
- **GET** `/api/grocy/stock/:stockId`
- Returns details of a specific stock item

## Chores

### Get All Chores
- **GET** `/api/grocy/chores`
- Returns a list of all chores

### Undo Chore Execution
- **POST** `/api/grocy/chores/executions/:executionId/undo`
- Undoes a chore execution
- Returns the result of the operation

## Batteries

### Get All Batteries
- **GET** `/api/grocy/batteries`
- Returns a list of all batteries

### Undo Battery Charge Cycle
- **POST** `/api/grocy/batteries/charge-cycles/:chargeCycleId/undo`
- Undoes a battery charge cycle
- Returns the result of the operation

## Tasks

### Get All Tasks
- **GET** `/api/grocy/tasks`
- Returns a list of all tasks

### Undo Task Completion
- **POST** `/api/grocy/tasks/:taskId/undo`
- Undoes a task completion
- Returns the result of the operation

## Generic Undo Endpoint

### Undo Action
- **POST** `/api/grocy/undo/:entityType/:id`
- Unified endpoint for undoing various actions
- `entityType` can be 'chores', 'batteries', or 'tasks'
- `id` is the ID of the execution, charge cycle, or task
- Returns the result of the undo operation
