import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useSavings = () =>
  useQuery({
    queryKey: ['savings'],
    queryFn: () => api.get('/savings').then((r) => r.data),
  });

export const useSavingsEntries = (savingsId) =>
  useQuery({
    queryKey: ['savingsEntries', savingsId],
    queryFn: () => api.get(`/savings/${savingsId}/entries`).then((r) => r.data),
    enabled: !!savingsId,
  });

export const useCreateSavings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/savings', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['savings'] }),
  });
};

export const useUpdateSavings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/savings/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['savings'] }),
  });
};

export const useDeleteSavings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/savings/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['savings'] }),
  });
};

export const useAddSavingsEntry = (savingsId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post(`/savings/${savingsId}/entries`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['savings'] });
      qc.invalidateQueries({ queryKey: ['savingsEntries', savingsId] });
    },
  });
};

export const useDeleteSavingsEntry = (savingsId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entryId) => api.delete(`/savings/${savingsId}/entries/${entryId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['savings'] });
      qc.invalidateQueries({ queryKey: ['savingsEntries', savingsId] });
    },
  });
};
