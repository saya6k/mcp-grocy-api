/**
 * Data validation utilities for Grocy API requests and responses
 */

/**
 * Validates numeric data to ensure it meets Grocy's requirements
 * @param {any} value - The value to validate
 * @param {string} fieldName - Name of the field for error messages
 * @returns {{ isValid: boolean, error?: string, value: any }} Validation result
 */
const validateNumeric = (value, fieldName = 'Value') => {
  // If the value is undefined or null, it's valid (will use defaults)
  if (value === undefined || value === null) {
    return { isValid: true, value };
  }

  // Convert to number if it's a string
  if (typeof value === 'string') {
    value = value.trim();
    // Empty string might be valid depending on context
    if (value === '') {
      return { isValid: true, value: '' };
    }
    
    const num = Number(value);
    if (isNaN(num)) {
      return { 
        isValid: false, 
        error: `${fieldName} must be a valid number, received: "${value}"`,
        value
      };
    }
    value = num;
  }

  // Now value should be a number
  if (typeof value !== 'number') {
    return { 
      isValid: false, 
      error: `${fieldName} must be a number, received type: ${typeof value}`,
      value
    };
  }

  return { isValid: true, value };
};

/**
 * Validates an object with numeric fields
 * @param {object} obj - The object to validate
 * @param {string[]} numericFields - Array of field names that should be numeric
 * @returns {{ isValid: boolean, errors: string[], validatedObj: object }} Validation result
 */
const validateObject = (obj, numericFields = []) => {
  if (!obj || typeof obj !== 'object') {
    return { 
      isValid: false, 
      errors: ['Invalid input: expected an object'], 
      validatedObj: obj 
    };
  }

  const validatedObj = { ...obj };
  const errors = [];

  for (const field of numericFields) {
    if (field in obj) {
      const result = validateNumeric(obj[field], field);
      if (!result.isValid) {
        errors.push(result.error);
      } else {
        validatedObj[field] = result.value;
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    validatedObj
  };
};

module.exports = {
  validateNumeric,
  validateObject
};