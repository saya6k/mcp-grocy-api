const express = require('express');
const asyncHandler = require('express-async-handler');
const grocyApi = require('../grocyApi');

const router = express.Router();

// ...existing code...

// Recipe operations
router.get('/recipes', asyncHandler(async (req, res) => {
  const recipes = await grocyApi.recipes.getAllRecipes();
  res.json(recipes);
}));

router.get('/recipes/:recipeId', asyncHandler(async (req, res) => {
  const recipeId = req.params.recipeId;
  const recipe = await grocyApi.recipes.getRecipeById(recipeId);
  res.json(recipe);
}));

router.get('/recipes/:recipeId/fulfillment', asyncHandler(async (req, res) => {
  const recipeId = req.params.recipeId;
  const fulfillment = await grocyApi.recipes.getRecipeFulfillment(recipeId);
  res.json(fulfillment);
}));

router.get('/recipes-fulfillment', asyncHandler(async (req, res) => {
  const fulfillment = await grocyApi.recipes.getAllRecipesFulfillment();
  res.json(fulfillment);
}));

router.post('/recipes/:recipeId/add-not-fulfilled-products-to-shoppinglist', asyncHandler(async (req, res) => {
  const recipeId = req.params.recipeId;
  const result = await grocyApi.recipes.addNotFulfilledProductsToShoppingList(recipeId);
  res.json(result);
}));

// Chores routes
// ...existing chores routes...

router.post('/chores/executions/:executionId/undo', asyncHandler(async (req, res) => {
  const executionId = req.params.executionId;
  const result = await grocyApi.chores.undoChoreExecution(executionId);
  res.json(result);
}));

// Batteries routes
// ...existing batteries routes...

router.post('/batteries/charge-cycles/:chargeCycleId/undo', asyncHandler(async (req, res) => {
  const chargeCycleId = req.params.chargeCycleId;
  const result = await grocyApi.batteries.undoChargeCycle(chargeCycleId);
  res.json(result);
}));

// Tasks routes
// ...existing tasks routes...

router.post('/tasks/:taskId/undo', asyncHandler(async (req, res) => {
  const taskId = req.params.taskId;
  const result = await grocyApi.tasks.undoTaskCompletion(taskId);
  res.json(result);
}));

// Generic undo endpoint that can handle different entity types
router.post('/undo/:entityType/:id', asyncHandler(async (req, res) => {
  const { entityType, id } = req.params;
  let result;
  
  switch (entityType.toLowerCase()) {
    case 'chore':
    case 'chores':
      result = await grocyApi.chores.undoChoreExecution(id);
      break;
    case 'battery':
    case 'batteries':
      result = await grocyApi.batteries.undoChargeCycle(id);
      break;
    case 'task':
    case 'tasks':
      result = await grocyApi.tasks.undoTaskCompletion(id);
      break;
    default:
      return res.status(400).json({ error: `Unsupported entity type: ${entityType}` });
  }
  
  res.json(result);
}));

// ...existing code...

module.exports = router;