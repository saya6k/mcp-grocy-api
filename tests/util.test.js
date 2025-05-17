import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { undoAction } from '../src/services/grocy-api/util.js';
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

describe('Utility Functions', () => {
  beforeEach(() => {
    axios.post.mockReset();
  });

  describe('undoAction', () => {
    it('should handle chore executions', async () => {
      axios.post.mockResolvedValueOnce({ data: { success: true, message: 'Chore execution undone' } });
      
      const result = await undoAction('chores', '123');
      
      expect(axios.post).toHaveBeenCalledWith('http://test-grocy-url.com/api/chores/executions/123/undo');
      expect(result).toEqual({ success: true, message: 'Chore execution undone' });
    });

    it('should handle battery charge cycles', async () => {
      axios.post.mockResolvedValueOnce({ data: { success: true, message: 'Battery charge cycle undone' } });
      
      const result = await undoAction('battery', '456');
      
      expect(axios.post).toHaveBeenCalledWith('http://test-grocy-url.com/api/batteries/charge-cycles/456/undo');
      expect(result).toEqual({ success: true, message: 'Battery charge cycle undone' });
    });

    it('should handle tasks', async () => {
      axios.post.mockResolvedValueOnce({ data: { success: true, message: 'Task undone' } });
      
      const result = await undoAction('tasks', '789');
      
      expect(axios.post).toHaveBeenCalledWith('http://test-grocy-url.com/api/tasks/789/undo');
      expect(result).toEqual({ success: true, message: 'Task undone' });
    });

    it('should throw an error for unsupported entity types', async () => {
      await expect(undoAction('unsupported', '123')).rejects.toThrow('Unsupported entity type: unsupported');
    });

    it('should throw an ApiError when the request fails', async () => {
      const errorMessage = 'Network Error';
      axios.post.mockRejectedValueOnce(new Error(errorMessage));
      
      await expect(undoAction('chores', '123')).rejects.toThrow(ApiError);
      await expect(undoAction('chores', '123')).rejects.toThrow(`Failed to undo chores action: ${errorMessage}`);
    });
  });
});
