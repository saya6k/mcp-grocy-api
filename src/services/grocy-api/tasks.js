const { ApiError, formatError } = require('./errors');
const { undoAction } = require('./util');

const { getTasks, createTask, updateTask, deleteTask } = require('./tasks');

/**
 * Undo a task completion
 * @param {number|string} taskId - ID of the task to undo
 * @returns {Promise<Object>} Result of the undo operation
 */
const undoTaskCompletion = async (taskId) => {
  try {
    return await undoAction('tasks', taskId);
  } catch (error) {
    throw new ApiError(`Failed to undo task completion: ${formatError(error)}`);
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  undoTaskCompletion,
};