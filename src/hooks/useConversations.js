import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as convApi from '../services/api/conversations.api';
import { useUiStore } from '../store/uiStore';

const KEY = ['conversations'];

export function useConversations() {
  // polling until we have a websocket for this
  return useQuery({ queryKey: KEY, queryFn: convApi.fetchConversations, staleTime: 15_000 });
}

export function useSendManualReply() {
  const qc = useQueryClient();
  const addToast = useUiStore((s) => s.addToast);
  return useMutation({
    mutationFn: ({ id, text }) => convApi.sendManualReply(id, text),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: (err) => addToast(err.message, 'error'),
  });
}

export function useResolveConversation() {
  const qc = useQueryClient();
  const addToast = useUiStore((s) => s.addToast);
  return useMutation({
    mutationFn: convApi.resolveConversation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      addToast('Conversation marked resolved.');
    },
  });
}
