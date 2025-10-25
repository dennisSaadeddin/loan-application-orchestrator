import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runsApi } from './runs';
import apiClient from './client';

// Mock the API client
vi.mock('./client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('runsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all runs', async () => {
      const mockRuns = [
        {
          id: 1,
          application_id: 1,
          pipeline_id: 1,
          status: 'APPROVED',
          step_logs: [],
          started_at: '2025-10-25T10:00:00Z',
          completed_at: '2025-10-25T10:00:05Z',
        },
        {
          id: 2,
          application_id: 2,
          pipeline_id: 1,
          status: 'REJECTED',
          step_logs: [],
          started_at: '2025-10-25T11:00:00Z',
          completed_at: '2025-10-25T11:00:05Z',
        },
      ];

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockRuns });

      const result = await runsApi.getAll();

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/runs');
      expect(result).toEqual(mockRuns);
    });

    it('should handle empty runs array', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [] });

      const result = await runsApi.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('should fetch a run by ID', async () => {
      const mockRun = {
        id: 1,
        application_id: 1,
        pipeline_id: 1,
        status: 'APPROVED' as const,
        step_logs: [
          {
            step_type: 'dti_rule' as const,
            order: 1,
            passed: true,
            details: { dti: 0.3, max_dti: 0.4 },
            executed_at: '2025-10-25T10:00:01Z',
          },
        ],
        started_at: '2025-10-25T10:00:00Z',
        completed_at: '2025-10-25T10:00:05Z',
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockRun });

      const result = await runsApi.getById(1);

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/runs/1');
      expect(result).toEqual(mockRun);
    });
  });

  describe('create', () => {
    it('should create and execute a run', async () => {
      const createRequest = {
        application_id: 1,
        pipeline_id: 1,
      };

      const mockRun = {
        id: 3,
        application_id: 1,
        pipeline_id: 1,
        status: 'APPROVED' as const,
        step_logs: [],
        started_at: '2025-10-25T12:00:00Z',
        completed_at: '2025-10-25T12:00:05Z',
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockRun });

      const result = await runsApi.create(createRequest);

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/runs', createRequest);
      expect(result).toEqual(mockRun);
    });
  });
});
