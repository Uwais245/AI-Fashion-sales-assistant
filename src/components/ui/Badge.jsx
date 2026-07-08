const TONE_STYLES = {
  green: 'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700',
  gray: 'bg-gray-100 text-gray-700',
  orange: 'bg-orange-100 text-orange-700',
  purple: 'bg-purple-100 text-purple-700',
};

const Badge = ({ tone = 'gray', children }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${TONE_STYLES[tone] || TONE_STYLES.gray}`}>
    {children}
  </span>
);

export default Badge;
