const axios = require('axios');
const { apiUrl, ApiError, formatError } = require('./config');

/**
 * Undo an action for different entity types (chores, batteries, tasks)
 * @param {string} entityType - Type of entity ('chores', 'batteries', 'tasks')
 * @param {number|string} id - ID of the execution, charge cycle, or task
 * @returns {Promise<Object>} Result of the undo operation
 */
const undoAction = async (entityType, id) => {
  try {
    let endpoint;
    switch (entityType.toLowerCase()) {
      case 'chore':
      case 'chores':
        endpoint = `${apiUrl}/chores/executions/${id}/undo`;
        break;
      case 'battery':
      case 'batteries':
        endpoint = `${apiUrl}/batteries/charge-cycles/${id}/undo`;
        break;
      case 'task':
      case 'tasks':
        endpoint = `${apiUrl}/tasks/${id}/undo`;
        break;
      default:
        throw new Error(`Unsupported entity type: ${entityType}`);
    }
    
    const response = await axios.post(endpoint);
    return response.data;
  } catch (error) {
    throw new ApiError(`Failed to undo ${entityType} action: ${formatError(error)}`);
  }
};

module.exports = {
  undoAction,
};