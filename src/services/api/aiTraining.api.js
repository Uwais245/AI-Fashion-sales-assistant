import { mockRequest } from '../mockClient';
import { aiRules, nextId } from '../mockData';
import { USE_MOCK } from '../config';
import apiClient from '../apiClient';

export function fetchAiRules() {
  if (!USE_MOCK) return apiClient.get('/ai-rules').then((r) => r.data);
  return mockRequest(() => [...aiRules]);
}

export function createAiRule(payload) {
  if (!USE_MOCK) return apiClient.post('/ai-rules', payload).then((r) => r.data);
  return mockRequest(() => {
    const rule = { id: nextId('r'), ...payload };
    aiRules.unshift(rule);
    return rule;
  }, { delay: 450 });
}

export function deleteAiRule(id) {
  if (!USE_MOCK) return apiClient.delete(`/ai-rules/${id}`).then(() => ({ success: true }));
  return mockRequest(() => {
    const idx = aiRules.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Rule not found.');
    aiRules.splice(idx, 1);
    return { success: true };
  }, { delay: 300 });
}
