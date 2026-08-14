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
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    key: 'totalOrders',
    label: 'Orders',
    icon: '📦',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
  },
  {
    key: 'refundRequests',
    label: 'Refund Requests',
    icon: '↩',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    key: 'approvedRefunds',
    label: 'Approved',
    icon: '✓',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    key: 'deniedRefunds',
    label: 'Denied',
    icon: '×',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
  },
] as const;

export function Stats({ stats }: StatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {statItems.map((item) => (
        <div
          key={item.key}
          className="group rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-lg shadow-black/5 transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-700 hover:bg-zinc-900"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">
                {item.label}
              </p>

              <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
                {stats[item.key]}
              </p>
            </div>

            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.bg} ${item.color}`}
            >
              <span className="text-lg font-semibold">{item.icon}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}