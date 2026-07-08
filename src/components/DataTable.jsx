import { useMemo, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { TableSkeleton } from './ui/LoadingSkeleton';
import EmptyState from './ui/EmptyState';

/**
 * Generic, config-driven table.
 *
 * columns: [{ key, header, render?(row), align? }]
 * data: array of row objects
 * rowKey: fn(row) => unique key
 * pageSize: rows per page (client-side for now)
 */
const DataTable = ({
  columns,
  data = [],
  rowKey = (row) => row.id,
  isLoading = false,
  emptyTitle = 'No records found',
  emptyDescription,
  pageSize = 8,
}) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const pageData = useMemo(
    () => data.slice((page - 1) * pageSize, page * pageSize),
    [data, page, pageSize]
  );

  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <TableSkeleton cols={columns.length} />
      </div>
    );
  }

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm">
              {columns.map((col) => (
                <th key={col.key} className={`p-4 font-medium ${col.align === 'center' ? 'text-center' : ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {pageData.map((row) => (
              <tr key={rowKey(row)} className="hover:bg-gray-50 transition">
                {columns.map((col) => (
                  <td key={col.key} className={`p-4 ${col.align === 'center' ? 'text-center' : ''}`}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
          <span>
            Page {page} of {totalPages} &middot; {data.length} total
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FiChevronLeft />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
