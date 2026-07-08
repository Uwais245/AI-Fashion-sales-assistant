import { useState } from 'react';
import { FiEye } from 'react-icons/fi';
import { useOrders, useUpdateOrderStatus } from '../hooks/useOrders';
import DataTable from '../components/DataTable';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { STATUS_TONE } from '../utils/tones';

const STATUS_OPTIONS = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];

const OrderDetailModal = ({ order, onClose }) => {
  const updateOrder = useUpdateOrderStatus();
  const [status, setStatus] = useState(order?.status);
  const [tracking, setTracking] = useState(order?.trackingNumber || '');

  if (!order) return null;

  const save = async () => {
    await updateOrder.mutateAsync({ id: order.id, status, trackingNumber: tracking });
    onClose();
  };

  return (
    <Modal isOpen={!!order} onClose={onClose} title={order.orderId} maxWidth="max-w-lg">
      <div className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-gray-400">Customer</p><p className="font-medium text-gray-800">{order.customerName}</p></div>
          <div><p className="text-gray-400">Amount</p><p className="font-medium text-gray-800">Rs {order.amount.toLocaleString()}</p></div>
          <div><p className="text-gray-400">Payment</p><Badge tone={STATUS_TONE[order.paymentStatus] || 'gray'}>{order.paymentStatus}</Badge></div>
          <div><p className="text-gray-400">Date</p><p className="font-medium text-gray-800">{order.date}</p></div>
        </div>

        <div>
          <p className="text-gray-400 mb-1">Products</p>
          {order.products.map((p, i) => (
            <p key={i} className="text-gray-700">{p.name} × {p.qty}</p>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none bg-white">
            {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
          <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="e.g. TCS-89012" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none" />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={save} isLoading={updateOrder.isPending}>Save Changes</Button>
        </div>
      </div>
    </Modal>
  );
};

const Orders = () => {
  const { data: orders, isLoading } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState(null);

  const columns = [
    { key: 'orderId', header: 'Order ID', render: (o) => <span className="font-medium text-primary">{o.orderId}</span> },
    { key: 'customerName', header: 'Customer', render: (o) => <span className="text-gray-800">{o.customerName}</span> },
    { key: 'products', header: 'Products', render: (o) => <span className="text-gray-600">{o.products.map((p) => `${p.name} (x${p.qty})`).join(', ')}</span> },
    { key: 'status', header: 'Status', render: (o) => <Badge tone={STATUS_TONE[o.status] || 'gray'}>{o.status}</Badge> },
    { key: 'paymentStatus', header: 'Payment', render: (o) => <Badge tone={STATUS_TONE[o.paymentStatus] || 'gray'}>{o.paymentStatus}</Badge> },
    { key: 'trackingNumber', header: 'Tracking #', render: (o) => <span className="text-gray-500">{o.trackingNumber || 'N/A'}</span> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (o) => (
        <button onClick={() => setSelectedOrder(o)} className="text-gray-500 hover:text-primary transition">
          <FiEye size={18} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Order Management</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <DataTable columns={columns} data={orders || []} isLoading={isLoading} emptyTitle="No orders yet" />
      </div>

      <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
};

export default Orders;
