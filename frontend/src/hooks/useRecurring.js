import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useRecurring = () =>
  useQuery({
    queryKey: ['recurring'],
    queryFn: () => api.get('/recurring').then((r) => r.data),
  });

export const useCreateRecurring = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/recurring', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recurring'] }),
  });
};

export const useDeleteRecurring = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/recurring/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recurring'] }),
  });
};

export const useApplyRecurring = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, date }) => api.post(`/recurring/${id}/apply`, { date }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  });
};
