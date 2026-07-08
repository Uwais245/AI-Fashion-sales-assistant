import { Link } from 'react-router-dom';
import { FiAlertTriangle } from 'react-icons/fi';
import Button from '../components/ui/Button';

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-4">
    <FiAlertTriangle className="text-5xl text-primary mb-4" />
    <h1 className="text-3xl font-bold text-gray-800">404 — Page not found</h1>
    <p className="text-gray-500 mt-2 max-w-sm">The page you're looking for doesn't exist or may have been moved.</p>
    <Link to="/" className="mt-6">
      <Button>Back to Dashboard</Button>
    </Link>
  </div>
);

export default NotFound;
