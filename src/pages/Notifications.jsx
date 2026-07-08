import { FiShoppingCart, FiAlertTriangle, FiPackage, FiMessageSquare } from 'react-icons/fi';
import { useOrders } from '../hooks/useOrders';
import { useConversations } from '../hooks/useConversations';
import { useProducts } from '../hooks/useProducts';
import EmptyState from '../components/ui/EmptyState';

const Notifications = () => {
  const { data: orders } = useOrders();
  const { data: conversations } = useConversations();
  const { data: products } = useProducts();

  // TODO(backend): move this to a real /notifications endpoint instead of deriving client-side
  const notifications = [
    ...(orders || [])
      .filter((o) => o.status === 'Pending')
      .map((o) => ({ id: `order-${o.id}`, icon: <FiShoppingCart className="text-purple-500" />, text: `New order ${o.orderId} from ${o.customerName} is pending.`, time: o.date })),
    ...(conversations || [])
      .filter((c) => c.sentiment === 'Angry' || c.status === 'flagged')
      .map((c) => ({ id: `conv-${c.id}`, icon: <FiAlertTriangle className="text-red-500" />, text: `${c.customerName} sent a message flagged as ${c.sentiment.toLowerCase()}.`, time: 'Just now' })),
    ...(products || [])
      .filter((p) => p.stock <= 5)
      .map((p) => ({ id: `stock-${p.id}`, icon: <FiPackage className="text-orange-500" />, text: `${p.name} is low on stock (${p.stock} left).`, time: 'Today' })),
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {notifications.length === 0 ? (
          <EmptyState icon={<FiMessageSquare />} title="You're all caught up" description="New orders, flagged conversations, and low-stock alerts will show up here." />
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((n) => (
              <div key={n.id} className="flex items-start gap-3 p-4 hover:bg-gray-50 transition">
                <div className="mt-0.5">{n.icon}</div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{n.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
