const EmptyState = ({ icon, title = 'Nothing here yet', description, action }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-6">
    {icon && <div className="text-4xl text-gray-300 mb-3">{icon}</div>}
    <p className="font-medium text-gray-700">{title}</p>
    {description && <p className="text-sm text-gray-400 mt-1 max-w-sm">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;
