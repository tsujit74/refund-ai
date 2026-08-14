'use client';

export interface StatsData {
  totalCustomers: number;
  totalOrders: number;
  refundRequests: number;
  approvedRefunds: number;
  deniedRefunds: number;
}

interface StatsProps {
  stats: StatsData;
}

const statItems = [
  {
    key: 'totalCustomers',
    label: 'Customers',
    icon: '👥',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    key: 'totalOrders',
    label: 'Orders',
    icon: '📦',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    key: 'refundRequests',
    label: 'Refund Requests',
    icon: '↩',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    key: 'approvedRefunds',
    label: 'Approved',
    icon: '✓',
    color: 'text-emerald-600',
    bg: 'emerald-50',
  },
  {
    key: 'deniedRefunds',
    label: 'Denied',
    icon: '×',
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
] as const;

export function Stats({ stats }: StatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {statItems.map((item) => (
        <div
          key={item.key}
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                {item.label}
              </p>

              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {stats[item.key]}
              </p>
            </div>

            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.bg} ${item.color}`}
            >
              <span className="text-lg font-semibold">
                {item.icon}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}