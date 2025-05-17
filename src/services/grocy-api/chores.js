const { ApiError, formatError } = require('./errors');
const { undoAction } = require('./util');

const { getChoreById, getChores, createChore, updateChore, deleteChore } = require('./chores');

/**
 * Undo a chore execution
 * @param {number|string} executionId - ID of the chore execution to undo
 * @returns {Promise<Object>} Result of the undo operation
 */
const undoChoreExecution = async (executionId) => {
  try {
    return await undoAction('chores', executionId);
  } catch (error) {
    throw new ApiError(`Failed to undo chore execution: ${formatError(error)}`);
  }
};

module.exports = {
  getChoreById,
  getChores,
  createChore,
  updateChore,
  deleteChore,
  undoChoreExecution,
};