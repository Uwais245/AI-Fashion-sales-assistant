import { useState } from 'react';
import { FiUser, FiSend, FiInstagram, FiCheckCircle } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useConversations, useSendManualReply, useResolveConversation } from '../hooks/useConversations';
import Badge from '../components/ui/Badge';
import { SENTIMENT_TONE } from '../utils/tones';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/LoadingSkeleton';

const ChannelIcon = ({ channel }) =>
  channel === 'Instagram' ? <FiInstagram className="text-pink-500" /> : <FaWhatsapp className="text-green-500" />;

const Conversations = () => {
  const { data: conversations, isLoading } = useConversations();
  const sendReply = useSendManualReply();
  const resolve = useResolveConversation();
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState('');

  const active = conversations?.find((c) => c.id === activeId) || conversations?.[0];

  const handleSend = async () => {
    if (!draft.trim() || !active) return;
    await sendReply.mutateAsync({ id: active.id, text: draft });
    setDraft('');
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <TableSkeleton rows={6} cols={1} />
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <EmptyState title="No conversations yet" description="Instagram and WhatsApp chats will appear here once the AI starts handling messages." />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Contacts List */}
      <div className="w-1/3 border-r border-gray-100 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h3 className="font-bold text-gray-800">Active Chats</h3>
        </div>
        <div className="overflow-y-auto flex-1">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`w-full text-left p-4 border-b border-gray-100 flex items-center gap-3 transition ${
                c.id === active?.id ? 'bg-indigo-50' : 'hover:bg-gray-100'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                <FiUser />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <ChannelIcon channel={c.channel} />
                  <p className="font-medium text-gray-800 truncate">{c.customerName}</p>
                </div>
                <p className="text-xs text-gray-500 truncate">{c.lastMessage}</p>
              </div>
              <Badge tone={SENTIMENT_TONE[c.sentiment] || 'gray'}>{c.sentiment}</Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Box */}
      {active && (
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-white flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-800">Chat with {active.customerName}</h3>
              <p className="text-xs text-gray-400">{active.intent}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${active.status === 'flagged' ? 'bg-red-100 text-red-700' : active.status === 'resolved' ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                {active.status === 'ai-handling' ? 'AI is handling' : active.status === 'agent-handling' ? 'You took over' : active.status}
              </span>
              {active.status !== 'resolved' && (
                <Button variant="secondary" onClick={() => resolve.mutate(active.id)} isLoading={resolve.isPending}>
                  <FiCheckCircle /> Resolve
                </Button>
              )}
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto bg-gray-50 space-y-4">
            {active.messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'customer' ? 'justify-start' : 'justify-end'}`}>
                <div
                  className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                    msg.sender === 'customer'
                      ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                      : msg.sender === 'agent'
                      ? 'bg-green-600 text-white rounded-tr-none'
                      : 'bg-primary text-white rounded-tr-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span className={`text-[10px] block mt-1 ${msg.sender === 'customer' ? 'text-gray-400' : 'text-indigo-200'}`}>{msg.time}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a manual reply to take over from AI..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
            />
            <button onClick={handleSend} disabled={sendReply.isPending} className="bg-primary text-white p-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50">
              <FiSend />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Conversations;
