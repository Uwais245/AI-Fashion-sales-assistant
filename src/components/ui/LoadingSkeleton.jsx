export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <div className="p-4 space-y-3">
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex gap-4">
        {Array.from({ length: cols }).map((_, c) => (
          <div key={c} className="h-4 bg-gray-100 rounded animate-pulse flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const CardSkeleton = () => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 flex items-center gap-4">
    <div className="w-14 h-14 rounded-full bg-gray-100 animate-pulse" />
    <div className="flex-1 space-y-2">
      <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
      <div className="h-5 w-14 bg-gray-100 rounded animate-pulse" />
    </div>
  </div>
);
