import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationsApi } from '@/api';
import { CreateApplicationRequest } from '@/types';

const QUERY_KEY = 'applications';

export const useApplications = () => {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: applicationsApi.getAll,
  });
};

export const useApplication = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => applicationsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateApplicationRequest) => applicationsApi.create(data),
    onSuccess: () => {
      // Invalidate and refetch applications list
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};
