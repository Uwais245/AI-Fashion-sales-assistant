import { useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useOrders } from '../hooks/useOrders';
import { useConversations } from '../hooks/useConversations';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];

const Analytics = () => {
  const { data: orders, isLoading: loadingOrders } = useOrders();
  const { data: conversations, isLoading: loadingConvs } = useConversations();

  const salesByStatus = useMemo(() => {
    if (!orders) return [];
    const grouped = {};
    orders.forEach((o) => { grouped[o.status] = (grouped[o.status] || 0) + o.amount; });
    return Object.entries(grouped).map(([status, amount]) => ({ status, amount }));
  }, [orders]);

  const channelSplit = useMemo(() => {
    if (!conversations) return [];
    const grouped = {};
    conversations.forEach((c) => { grouped[c.channel] = (grouped[c.channel] || 0) + 1; });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [conversations]);

  const sentimentSplit = useMemo(() => {
    if (!conversations) return [];
    const grouped = {};
    conversations.forEach((c) => { grouped[c.sentiment] = (grouped[c.sentiment] || 0) + 1; });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [conversations]);

  const isLoading = loadingOrders || loadingConvs;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Analytics & Reports</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4">Revenue by Order Status</h3>
          {isLoading ? (
            <div className="h-64 bg-gray-50 rounded-lg animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={salesByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => `Rs ${v.toLocaleString()}`} />
                <Bar dataKey="amount" fill="#4F46E5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4">Conversations by Channel</h3>
          {isLoading ? (
            <div className="h-64 bg-gray-50 rounded-lg animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={channelSplit} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={3}>
                  {channelSplit.map((entry, i) => <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <h3 className="font-bold text-gray-800 mb-4">Sentiment Breakdown</h3>
          {isLoading ? (
            <div className="h-64 bg-gray-50 rounded-lg animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={sentimentSplit} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={90} />
                <Tooltip />
                <Bar dataKey="value" fill="#10B981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
