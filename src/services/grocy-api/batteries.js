const { ApiError, formatError } = require('./errors');
const { undoAction } = require('./util');

const { getBatteryById, createBattery, updateBattery, deleteBattery } = require('./batteries');

/**
 * Undo a battery charge cycle
 * @param {number|string} chargeCycleId - ID of the charge cycle to undo
 * @returns {Promise<Object>} Result of the undo operation
 */
const undoChargeCycle = async (chargeCycleId) => {
  try {
    return await undoAction('batteries', chargeCycleId);
  } catch (error) {
    throw new ApiError(`Failed to undo battery charge cycle: ${formatError(error)}`);
  }
};

module.exports = {
  getBatteryById,
  createBattery,
  updateBattery,
  deleteBattery,
  undoChargeCycle,
};