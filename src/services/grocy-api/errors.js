
/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Format error messages from axios errors or generic errors
 * @param {Error} error - The error object
 * @returns {string} Formatted error message
 */
const formatError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return `${error.message} - ${JSON.stringify(error.response.data)}`;
  } else if (error.request) {
    // The request was made but no response was received
    return `No response received: ${error.message}`;
  } else {
    // Something happened in setting up the request that triggered an Error
    return error.message || String(error);
  }
};

module.exports = {
  ApiError,
  formatError
};
