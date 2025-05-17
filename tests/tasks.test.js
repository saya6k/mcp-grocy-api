import { describe, it, expect, vi, beforeEach } from 'vitest';
import { undoTaskCompletion } from '../src/services/grocy-api/tasks.js';
import { ApiError } from '../src/services/grocy-api/errors.js';

// Mock the undoAction function from util.js
vi.mock('../src/services/grocy-api/util', () => ({
  undoAction: vi.fn()
}));

// Import the mocked undoAction so we can control it in tests
import { undoAction } from '../src/services/grocy-api/util.js';

describe('Tasks', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('undoTaskCompletion', () => {
    it('should call undoAction with correct parameters', async () => {
      const mockResponse = { success: true };
      undoAction.mockResolvedValueOnce(mockResponse);
      
      const result = await undoTaskCompletion('123');
      
      expect(undoAction).toHaveBeenCalledWith('tasks', '123');
      expect(result).toBe(mockResponse);
    });

    it('should handle string task IDs', async () => {
      const mockResponse = { success: true };
      undoAction.mockResolvedValueOnce(mockResponse);
      
      await undoTaskCompletion('abc123');
      
      expect(undoAction).toHaveBeenCalledWith('tasks', 'abc123');
    });

    it('should handle numeric task IDs', async () => {
      const mockResponse = { success: true };
      undoAction.mockResolvedValueOnce(mockResponse);
      
      await undoTaskCompletion(123);
      
      expect(undoAction).toHaveBeenCalledWith('tasks', 123);
    });

    it('should throw ApiError when undoAction fails', async () => {
      const errorMessage = 'Action failed';
      undoAction.mockRejectedValueOnce(new Error(errorMessage));
      
      await expect(undoTaskCompletion('123')).rejects.toThrow(ApiError);
      await expect(undoTaskCompletion('123')).rejects.toThrow(`Failed to undo task completion: ${errorMessage}`);
    });
  });
});
