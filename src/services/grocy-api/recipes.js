const axios = require('axios');
const { apiUrl, ApiError, formatError } = require('./config');

/**
 * Get fulfillment information for a specific recipe
 * @param {number|string} recipeId - ID of the recipe
 * @returns {Promise<Object>} Recipe fulfillment data
 */
const getRecipeFulfillment = async (recipeId) => {
  try {
    const response = await axios.get(`${apiUrl}/recipes/${recipeId}/fulfillment`);
    return response.data;
  } catch (error) {
    throw new ApiError(`Failed to get recipe fulfillment: ${formatError(error)}`);
  }
};

/**
 * Get fulfillment information for all recipes
 * @returns {Promise<Array>} Array of recipe fulfillment data
 */
const getAllRecipesFulfillment = async () => {
  try {
    const response = await axios.get(`${apiUrl}/recipes/fulfillment`);
    return response.data;
  } catch (error) {
    throw new ApiError(`Failed to get all recipes fulfillment: ${formatError(error)}`);
  }
};

/**
 * Add not fulfilled products of a recipe to the shopping list
 * @param {number|string} recipeId - ID of the recipe
 * @returns {Promise<Object>} Result of the operation
 */
const addNotFulfilledProductsToShoppingList = async (recipeId) => {
  try {
    const response = await axios.post(`${apiUrl}/recipes/${recipeId}/add-not-fulfilled-products-to-shoppinglist`);
    return response.data;
  } catch (error) {
    throw new ApiError(`Failed to add not fulfilled products to shopping list: ${formatError(error)}`);
  }
};

module.exports = {
  getRecipeFulfillment,
  getAllRecipesFulfillment,
  addNotFulfilledProductsToShoppingList,
};