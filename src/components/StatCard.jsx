const StatCard = ({ title, value, icon, bgColor = 'bg-blue-100', textColor = 'text-blue-600' }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${bgColor} ${textColor}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

export default StatCard;
