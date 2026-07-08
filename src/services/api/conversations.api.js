import { mockRequest } from '../mockClient';
import { conversations } from '../mockData';
import { USE_MOCK } from '../config';
import apiClient from '../apiClient';

export function fetchConversations() {
  if (!USE_MOCK) return apiClient.get('/conversations').then((r) => r.data);
  return mockRequest(() => [...conversations]);
}

export function fetchConversation(id) {
  if (!USE_MOCK) return apiClient.get(`/conversations/${id}`).then((r) => r.data);
  return mockRequest(() => {
    const found = conversations.find((c) => c.id === id);
    if (!found) throw new Error('Conversation not found.');
    return found;
  });
}

export function sendManualReply(id, text) {
  if (!USE_MOCK) return apiClient.post(`/conversations/${id}/reply`, { text }).then((r) => r.data);
  return mockRequest(() => {
    const conv = conversations.find((c) => c.id === id);
    if (!conv) throw new Error('Conversation not found.');
    conv.messages.push({ sender: 'agent', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    conv.lastMessage = text;
    conv.status = 'agent-handling';
    return conv;
  }, { delay: 350 });
}

export function resolveConversation(id) {
  if (!USE_MOCK) return apiClient.patch(`/conversations/${id}/resolve`).then((r) => r.data);
  return mockRequest(() => {
    const conv = conversations.find((c) => c.id === id);
    if (!conv) throw new Error('Conversation not found.');
    conv.status = 'resolved';
    return conv;
  }, { delay: 300 });
}
