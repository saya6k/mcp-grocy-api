/**
 * Encoding utilities for handling UTF-8 and special characters in API data
 */

/**
 * Ensures text is properly encoded as UTF-8
 * @param {string} text - The text to encode
 * @returns {string} UTF-8 encoded text
 */
const ensureUtf8 = (text) => {
  if (typeof text !== 'string') {
    return text;
  }
  
  try {
    // First decode from UTF-8 to handle any double-encoded text
    const decoded = decodeURIComponent(escape(text));
    // Re-encode to guarantee valid UTF-8
    return unescape(encodeURIComponent(decoded));
  } catch (e) {
    // If there's an error in the process, return the original
    console.error('UTF-8 encoding error:', e);
    return text;
  }
};

/**
 * Recursively ensures all string fields in an object or array are properly UTF-8 encoded
 * @param {any} data - The data structure to process
 * @returns {any} Processed data with UTF-8 encoding
 */
const ensureObjectFieldsUtf8 = (data) => {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    return ensureUtf8(data);
  }

  if (Array.isArray(data)) {
    return data.map(item => ensureObjectFieldsUtf8(item));
  }

  if (typeof data === 'object') {
    const newObj = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        newObj[key] = ensureObjectFieldsUtf8(data[key]);
      }
    }
    return newObj;
  }

  return data;
};

module.exports = {
  ensureUtf8,
  ensureObjectFieldsUtf8
};