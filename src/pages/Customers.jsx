import { useState } from 'react';
import { FiEye } from 'react-icons/fi';
import { useCustomers, useCustomer } from '../hooks/useCustomers';
import DataTable from '../components/DataTable';
import Modal from '../components/ui/Modal';
import SearchBar from '../components/ui/SearchBar';
import Badge from '../components/ui/Badge';
import { STATUS_TONE } from '../utils/tones';

const CustomerDetail = ({ id, onClose }) => {
  const { data: customer, isLoading } = useCustomer(id);

  return (
    <Modal isOpen={!!id} onClose={onClose} title={customer?.name || 'Customer'}>
      {isLoading || !customer ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-gray-400">Phone</p><p className="font-medium text-gray-800">{customer.phone}</p></div>
            <div><p className="text-gray-400">Instagram</p><p className="font-medium text-blue-500">{customer.instagramId}</p></div>
            <div className="col-span-2"><p className="text-gray-400">Address</p><p className="font-medium text-gray-800">{customer.address}</p></div>
            <div className="col-span-2"><p className="text-gray-400">Preferences</p><p className="font-medium text-gray-800">{customer.preferences}</p></div>
          </div>
          <div>
            <p className="font-semibold text-gray-800 mb-2">Order History</p>
            {customer.orders?.length === 0 ? (
              <p className="text-sm text-gray-400">No orders yet.</p>
            ) : (
              <div className="space-y-2">
                {customer.orders.map((o) => (
                  <div key={o.id} className="flex justify-between items-center text-sm border border-gray-100 rounded-lg px-3 py-2">
                    <span className="font-medium text-primary">{o.orderId}</span>
                    <Badge tone={STATUS_TONE[o.status] || 'gray'}>{o.status}</Badge>
                    <span className="text-gray-600">Rs {o.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

const Customers = () => {
  const { data: customers, isLoading } = useCustomers();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const filtered = (customers || []).filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  const columns = [
    { key: 'name', header: 'Name', render: (c) => <span className="font-medium text-gray-800">{c.name}</span> },
    { key: 'phone', header: 'Contact', render: (c) => <span className="text-gray-600">{c.phone}</span> },
    { key: 'instagramId', header: 'Instagram', render: (c) => <span className="text-blue-500">{c.instagramId}</span> },
    { key: 'address', header: 'Address', render: (c) => <span className="text-gray-600">{c.address}</span> },
    { key: 'preferences', header: 'Preferences', render: (c) => <span className="text-gray-600">{c.preferences}</span> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (c) => (
        <button onClick={() => setSelectedId(c.id)} className="text-primary hover:text-indigo-800 transition">
          <FiEye size={18} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Customers List</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name or phone..." />
        </div>
        <DataTable columns={columns} data={filtered} isLoading={isLoading} emptyTitle="No customers yet" />
      </div>

      <CustomerDetail id={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
};

export default Customers;
