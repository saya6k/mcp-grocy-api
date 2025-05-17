import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { getRecipeFulfillment, getAllRecipesFulfillment, addNotFulfilledProductsToShoppingList } from '../src/services/grocy-api/recipes.js';
import { ApiError } from '../src/services/grocy-api/errors.js';

// Mock modules
vi.mock('axios');
vi.mock('../src/services/grocy-api/config', () => ({
  apiUrl: 'http://test-grocy-url.com/api',
  ApiError: class ApiError extends Error {
    constructor(message) {
      super(message);
      this.name = 'ApiError';
    }
  },
  formatError: (error) => error.message || String(error)
}));

describe('Recipes', () => {
  beforeEach(() => {
    axios.get.mockReset();
    axios.post.mockReset();
  });

  describe('getRecipeFulfillment', () => {
    it('should get fulfillment information for a specific recipe', async () => {
      const mockResponse = {
        data: {
          recipe_id: '1',
          need_fulfilled: true,
          missing_products: []
        }
      };
      axios.get.mockResolvedValueOnce(mockResponse);
      
      const result = await getRecipeFulfillment('1');
      
      expect(axios.get).toHaveBeenCalledWith('http://test-grocy-url.com/api/recipes/1/fulfillment');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw ApiError when the request fails', async () => {
      const errorMessage = 'Network Error';
      axios.get.mockRejectedValueOnce(new Error(errorMessage));
      
      await expect(getRecipeFulfillment('1')).rejects.toThrow(ApiError);
      await expect(getRecipeFulfillment('1')).rejects.toThrow(`Failed to get recipe fulfillment: ${errorMessage}`);
    });

    it('should handle numeric recipe IDs', async () => {
      const mockResponse = { data: { recipe_id: '1' } };
      axios.get.mockResolvedValueOnce(mockResponse);
      
      await getRecipeFulfillment(1);
      
      expect(axios.get).toHaveBeenCalledWith('http://test-grocy-url.com/api/recipes/1/fulfillment');
    });
  });

  describe('getAllRecipesFulfillment', () => {
    it('should get fulfillment information for all recipes', async () => {
      const mockResponse = {
        data: [
          { recipe_id: '1', need_fulfilled: true },
          { recipe_id: '2', need_fulfilled: false }
        ]
      };
      axios.get.mockResolvedValueOnce(mockResponse);
      
      const result = await getAllRecipesFulfillment();
      
      expect(axios.get).toHaveBeenCalledWith('http://test-grocy-url.com/api/recipes/fulfillment');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw ApiError when the request fails', async () => {
      const errorMessage = 'Network Error';
      axios.get.mockRejectedValueOnce(new Error(errorMessage));
      
      await expect(getAllRecipesFulfillment()).rejects.toThrow(ApiError);
      await expect(getAllRecipesFulfillment()).rejects.toThrow(`Failed to get all recipes fulfillment: ${errorMessage}`);
    });
  });

  describe('addNotFulfilledProductsToShoppingList', () => {
    it('should add missing products from a recipe to the shopping list', async () => {
      const mockResponse = {
        data: { success: true, added_product_count: 2 }
      };
      axios.post.mockResolvedValueOnce(mockResponse);
      
      const result = await addNotFulfilledProductsToShoppingList('1');
      
      expect(axios.post).toHaveBeenCalledWith('http://test-grocy-url.com/api/recipes/1/add-not-fulfilled-products-to-shoppinglist');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw ApiError when the request fails', async () => {
      const errorMessage = 'Network Error';
      axios.post.mockRejectedValueOnce(new Error(errorMessage));
      
      await expect(addNotFulfilledProductsToShoppingList('1')).rejects.toThrow(ApiError);
      await expect(addNotFulfilledProductsToShoppingList('1')).rejects.toThrow(`Failed to add not fulfilled products to shopping list: ${errorMessage}`);
    });

    it('should handle numeric recipe IDs', async () => {
      const mockResponse = { data: { success: true } };
      axios.post.mockResolvedValueOnce(mockResponse);
      
      await addNotFulfilledProductsToShoppingList(1);
      
      expect(axios.post).toHaveBeenCalledWith('http://test-grocy-url.com/api/recipes/1/add-not-fulfilled-products-to-shoppinglist');
    });
  });
});
