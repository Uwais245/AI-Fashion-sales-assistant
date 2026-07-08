import { FiBox, FiUsers, FiShoppingCart, FiMessageSquare, FiDownload, FiAlertCircle } from 'react-icons/fi';
import { useProducts } from '../hooks/useProducts';
import { useCustomers } from '../hooks/useCustomers';
import { useOrders } from '../hooks/useOrders';
import { useConversations } from '../hooks/useConversations';
import StatCard from '../components/StatCard';
import { CardSkeleton } from '../components/ui/LoadingSkeleton';
import Badge from '../components/ui/Badge';
import { STATUS_TONE, SENTIMENT_TONE } from '../utils/tones';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { useUiStore } from '../store/uiStore';

const Dashboard = () => {
  const { data: products, isLoading: loadingProducts } = useProducts();
  const { data: customers, isLoading: loadingCustomers } = useCustomers();
  const { data: orders, isLoading: loadingOrders } = useOrders();
  const { data: conversations, isLoading: loadingConvs } = useConversations();
  const addToast = useUiStore((s) => s.addToast);

  const isLoading = loadingProducts || loadingCustomers || loadingOrders || loadingConvs;

  const stats = [
    { title: 'Total Products', value: products?.length ?? '—', icon: <FiBox className="text-2xl" />, bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
    { title: 'Total Customers', value: customers?.length ?? '—', icon: <FiUsers className="text-2xl" />, bgColor: 'bg-green-100', textColor: 'text-green-600' },
    { title: 'Total Orders', value: orders?.length ?? '—', icon: <FiShoppingCart className="text-2xl" />, bgColor: 'bg-purple-100', textColor: 'text-purple-600' },
    { title: 'Active Conversations', value: conversations?.length ?? '—', icon: <FiMessageSquare className="text-2xl" />, bgColor: 'bg-orange-100', textColor: 'text-orange-600' },
  ];

  const recentOrders = [...(orders || [])].slice(-5).reverse();
  const flaggedConversations = (conversations || []).filter((c) => c.sentiment === 'Angry' || c.sentiment === 'Frustrated' || c.status === 'flagged');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
        <Button onClick={() => addToast('Export started — check Export Center for the file.')}>
          <FiDownload /> Export Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          : stats.map((stat) => <StatCard key={stat.title} {...stat} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800">Recent Orders</h3>
          </div>
          {recentOrders.length === 0 ? (
            <EmptyState title="No orders yet" />
          ) : (
            <div className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between px-6 py-3 text-sm hover:bg-gray-50 transition">
                  <div>
                    <p className="font-medium text-primary">{order.orderId}</p>
                    <p className="text-gray-500 text-xs">{order.customerName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={STATUS_TONE[order.status] || 'gray'}>{order.status}</Badge>
                    <span className="font-medium text-gray-800">Rs {order.amount.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Flagged Conversations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-2">
            <FiAlertCircle className="text-red-500" />
            <h3 className="text-lg font-bold text-gray-800">Needs Attention</h3>
          </div>
          {flaggedConversations.length === 0 ? (
            <EmptyState title="Nothing flagged" description="Angry or frustrated conversations will surface here first." />
          ) : (
            <div className="divide-y divide-gray-100">
              {flaggedConversations.map((c) => (
                <div key={c.id} className="flex items-center justify-between px-6 py-3 text-sm hover:bg-gray-50 transition">
                  <div>
                    <p className="font-medium text-gray-800">{c.customerName}</p>
                    <p className="text-gray-500 text-xs truncate max-w-[220px]">{c.lastMessage}</p>
                  </div>
                  <Badge tone={SENTIMENT_TONE[c.sentiment] || 'gray'}>{c.sentiment}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
