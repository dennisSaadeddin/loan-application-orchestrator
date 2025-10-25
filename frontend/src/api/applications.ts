import apiClient from './client';
import { Application, CreateApplicationRequest } from '@/types';

export const applicationsApi = {
  // Get all applications
  getAll: async (): Promise<Application[]> => {
    const response = await apiClient.get<Application[]>('/api/v1/applications');
    return response.data;
  },

  // Get application by ID
  getById: async (id: number): Promise<Application> => {
    const response = await apiClient.get<Application>(`/api/v1/applications/${id}`);
    return response.data;
  },

  // Create new application
  create: async (data: CreateApplicationRequest): Promise<Application> => {
    const response = await apiClient.post<Application>('/api/v1/applications', data);
    return response.data;
  },
};
