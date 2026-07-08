import { useLocation, Link } from 'react-router-dom';
import { FiBell, FiUser } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import { useOrders } from '../hooks/useOrders';
import { useConversations } from '../hooks/useConversations';
import { useProducts } from '../hooks/useProducts';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/products': 'Products',
  '/customers': 'Customers',
  '/orders': 'Orders',
  '/conversations': 'Conversations',
  '/train-ai': 'AI Training',
  '/analytics': 'Analytics',
  '/notifications': 'Notifications',
  '/settings': 'Settings',
};

const Navbar = () => {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const { data: orders } = useOrders();
  const { data: conversations } = useConversations();
  const { data: products } = useProducts();

  const notificationCount =
    (orders || []).filter((o) => o.status === 'Pending').length +
    (conversations || []).filter((c) => c.sentiment === 'Angry' || c.status === 'flagged').length +
    (products || []).filter((p) => p.stock <= 5).length;

  const title = PAGE_TITLES[location.pathname] || 'Admin Panel';

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="text-lg font-semibold text-gray-800">{title}</div>

      <div className="flex items-center gap-4">
        <Link to="/notifications" className="p-2 text-gray-500 hover:text-primary transition-colors relative">
          <FiBell className="text-xl" />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 rounded-full border border-white text-[10px] text-white flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
            <FiUser />
          </div>
          <span className="text-sm text-gray-600 hidden sm:inline">{user?.name || 'Admin'}</span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
