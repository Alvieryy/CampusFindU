export function CardGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm flex flex-col"
        >
          <div className="w-full h-48 bg-gray-200" />
          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="h-5 bg-gray-200 rounded-md w-3/4" />
              <div className="h-3.5 bg-gray-150 rounded w-full" />
              <div className="h-3.5 bg-gray-150 rounded w-2/3" />
            </div>
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-pulse">
      <div className="p-4 sm:p-6 border-b border-gray-150 flex items-center justify-between">
        <div className="h-6 bg-gray-200 rounded w-48" />
        <div className="h-8 bg-gray-200 rounded-lg w-24" />
      </div>
      <div className="p-4 sm:p-6 space-y-4">
        <div className="flex gap-4 pb-3 border-b border-gray-100">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded flex-1" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 items-center py-3">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="h-4 bg-gray-150 rounded flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton({ isAdmin = false }) {
  const cardCount = isAdmin ? 6 : 4;
  return (
    <div className="max-w-7xl mx-auto pb-12 animate-pulse font-sans">
      <div className="space-y-2 mb-8">
        <div className="h-8 bg-gray-200 rounded-lg w-64" />
        <div className="h-4 bg-gray-150 rounded w-96 max-w-full" />
      </div>

      <div
        className={`grid gap-4 mb-8 ${
          isAdmin
            ? "grid-cols-2 md:grid-cols-6"
            : "grid-cols-2 md:grid-cols-4"
        }`}
      >
        {Array.from({ length: cardCount }).map((_, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center space-y-3"
          >
            <div className="h-3 bg-gray-200 rounded w-20" />
            <div className="h-8 bg-gray-200 rounded w-12" />
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="h-6 bg-gray-200 rounded w-40" />
        <div className="h-64 bg-gray-100 rounded-lg" />
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-pulse font-sans">
      <div className="h-5 bg-gray-200 rounded w-32 mb-6" />
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 h-64 bg-gray-200 rounded-xl shrink-0" />
          <div className="flex-1 space-y-4">
            <div className="h-7 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-150 rounded w-1/3" />
            <div className="space-y-2 pt-4">
              <div className="h-4 bg-gray-150 rounded w-full" />
              <div className="h-4 bg-gray-150 rounded w-5/6" />
              <div className="h-4 bg-gray-150 rounded w-2/3" />
            </div>
            <div className="h-10 bg-gray-200 rounded-xl w-40 pt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 5 }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-xl border border-gray-200 bg-white shadow-sm flex items-center justify-between"
        >
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-3 bg-gray-150 rounded w-2/3" />
          </div>
          <div className="h-6 bg-gray-200 rounded w-16" />
        </div>
      ))}
    </div>
  );
}
