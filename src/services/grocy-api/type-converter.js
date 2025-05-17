/**
 * Type converter for Grocy API responses
 * This addresses the issue where Grocy API in 4.5.0 returns numbers without quotes
 */

/**
 * Converts string numbers to actual numbers in API responses
 * @param {any} data - The data to convert
 * @returns {any} The converted data
 */
const convertStringToNumber = (data) => {
  if (data === null || data === undefined) {
    return data;
  }

  // If it's a string that looks like a number, convert it
  if (typeof data === 'string' && !isNaN(Number(data)) && data.trim() !== '') {
    return Number(data);
  }

  // If it's an array, convert its elements
  if (Array.isArray(data)) {
    return data.map(item => convertStringToNumber(item));
  }

  // If it's an object, convert its properties
  if (typeof data === 'object') {
    const newObj = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        newObj[key] = convertStringToNumber(data[key]);
      }
    }
    return newObj;
  }

  return data;
};

/**
 * Ensures numeric parameters are sent as numbers, not strings
 * @param {any} params - The parameters to validate
 * @returns {any} The validated parameters
 */
const ensureNumericParams = (params) => {
  if (!params || typeof params !== 'object') {
    return params;
  }

  const result = { ...params };

  // List of parameters that should be numbers
  const numericParams = [
    'amount', 'price', 'productId', 'recipeId', 'choreId', 'taskId',
    'batteryId', 'locationId', 'locationIdFrom', 'locationIdTo',
    'servings', 'executedBy', 'storeId', 'shoppingListId', 'stockEntryId'
  ];

  for (const param of numericParams) {
    if (param in result && result[param] !== null && result[param] !== undefined) {
      // Convert to number if it's a string
      if (typeof result[param] === 'string') {
        const num = Number(result[param]);
        if (!isNaN(num)) {
          result[param] = num;
        }
      }
    }
  }

  return result;
};

module.exports = {
  convertStringToNumber,
  ensureNumericParams
};