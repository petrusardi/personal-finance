import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useBudgets = (month, year) =>
  useQuery({
    queryKey: ['budgets', month, year],
    queryFn: () => api.get('/budgets', { params: { month, year } }).then((r) => r.data),
  });

export const useUpsertBudget = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/budgets', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
  });
};
