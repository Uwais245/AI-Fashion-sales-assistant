import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as aiApi from '../services/api/aiTraining.api';
import { useUiStore } from '../store/uiStore';

const KEY = ['aiRules'];

export function useAiRules() {
  return useQuery({ queryKey: KEY, queryFn: aiApi.fetchAiRules });
}

export function useCreateAiRule() {
  const qc = useQueryClient();
  const addToast = useUiStore((s) => s.addToast);
  return useMutation({
    mutationFn: aiApi.createAiRule,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      addToast('AI rule saved.');
    },
    onError: (err) => addToast(err.message, 'error'),
  });
}

export function useDeleteAiRule() {
  const qc = useQueryClient();
  const addToast = useUiStore((s) => s.addToast);
  return useMutation({
    mutationFn: aiApi.deleteAiRule,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      addToast('Rule removed.');
    },
  });
}
