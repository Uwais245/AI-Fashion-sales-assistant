import { FiSearch } from 'react-icons/fi';

const SearchBar = ({ value, onChange, placeholder = 'Search...', className = 'max-w-md' }) => (
  <div className={`relative flex-1 ${className}`}>
    <FiSearch className="absolute left-3 top-3 text-gray-400" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
    />
  </div>
);

export default SearchBar;
