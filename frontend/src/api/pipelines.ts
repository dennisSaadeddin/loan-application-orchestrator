import apiClient from './client';
import { Pipeline, CreatePipelineRequest, UpdatePipelineRequest } from '@/types';

export const pipelinesApi = {
  // Get all pipelines
  getAll: async (): Promise<Pipeline[]> => {
    const response = await apiClient.get<Pipeline[]>('/api/v1/pipelines');
    return response.data;
  },

  // Get pipeline by ID
  getById: async (id: number): Promise<Pipeline> => {
    const response = await apiClient.get<Pipeline>(`/api/v1/pipelines/${id}`);
    return response.data;
  },

  // Create new pipeline
  create: async (data: CreatePipelineRequest): Promise<Pipeline> => {
    const response = await apiClient.post<Pipeline>('/api/v1/pipelines', data);
    return response.data;
  },

  // Update existing pipeline
  update: async (id: number, data: UpdatePipelineRequest): Promise<Pipeline> => {
    const response = await apiClient.put<Pipeline>(`/api/v1/pipelines/${id}`, data);
    return response.data;
  },
};
