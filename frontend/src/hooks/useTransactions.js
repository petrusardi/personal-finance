import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useTransactions = (filters) =>
  useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => api.get('/transactions', { params: filters }).then((r) => r.data),
  });

export const useSummary = (month, year) =>
  useQuery({
    queryKey: ['summary', month, year],
    queryFn: () => api.get('/transactions/summary', { params: { month, year } }).then((r) => r.data),
  });

export const useByCategory = (month, year) =>
  useQuery({
    queryKey: ['byCategory', month, year],
    queryFn: () => api.get('/transactions/by-category', { params: { month, year } }).then((r) => r.data),
  });

export const useByPaymentMethod = (month, year) =>
  useQuery({
    queryKey: ['byPaymentMethod', month, year],
    queryFn: () => api.get('/transactions/by-payment-method', { params: { month, year } }).then((r) => r.data),
  });

export const useDailyExpenses = (month, year) =>
  useQuery({
    queryKey: ['dailyExpenses', month, year],
    queryFn: () => api.get('/transactions/daily', { params: { month, year } }).then((r) => r.data),
  });

export const useYearlySummary = (year) =>
  useQuery({
    queryKey: ['yearlySummary', year],
    queryFn: () => api.get('/transactions/yearly', { params: { year } }).then((r) => r.data),
  });

export const useCreateTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/transactions', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  });
};

export const useUpdateTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/transactions/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['summary'] });
      qc.invalidateQueries({ queryKey: ['byCategory'] });
      qc.invalidateQueries({ queryKey: ['currentBalance'] });
    },
  });
};

export const useDeleteTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/transactions/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  });
};

export const useTrend = () =>
  useQuery({
    queryKey: ['trend'],
    queryFn: () => api.get('/transactions/trend').then((r) => r.data),
  });

export const useByWeekday = (month, year) =>
  useQuery({
    queryKey: ['byWeekday', month, year],
    queryFn: () => api.get('/transactions/by-weekday', { params: { month, year } }).then((r) => r.data),
  });
