import apiClient from './client';
import { Run, CreateRunRequest } from '@/types';

export const runsApi = {
  // Get all runs
  getAll: async (): Promise<Run[]> => {
    const response = await apiClient.get<Run[]>('/api/v1/runs');
    return response.data;
  },

  // Get run by ID
  getById: async (id: number): Promise<Run> => {
    const response = await apiClient.get<Run>(`/api/v1/runs/${id}`);
    return response.data;
  },

  // Create and execute a run
  create: async (data: CreateRunRequest): Promise<Run> => {
    const response = await apiClient.post<Run>('/api/v1/runs', data);
    return response.data;
  },
};
