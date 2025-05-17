
// Base URL for Grocy API
const apiUrl = process.env.GROCY_BASE_URL ? `${process.env.GROCY_BASE_URL}/api` : 'http://localhost:9283/api';

// Export the ApiError and formatError from errors.js
const { ApiError, formatError } = require('./errors');

module.exports = {
  apiUrl,
  ApiError,
  formatError
};
