'use client';

import { Customer } from './useCustomer';

interface CustomerSelectorProps {
  customers: Customer[];
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer) => void;
  loading?: boolean;
}

export function CustomerSelector({
  customers,
  selectedCustomer,
  onSelectCustomer,
  loading = false,
}: CustomerSelectorProps) {
  return (
    <div className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
      <div className="mx-auto flex w-full max-w-4xl items-center gap-3">
        <div className="hidden h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 sm:flex">
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20 21a8 8 0 0 0-16 0" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Customer
          </div>

          <div className="relative">
            <select
              value={selectedCustomer?._id || ''}
              onChange={(e) => {
                const customer = customers.find(
                  (c) => c._id === e.target.value
                );

                if (customer) {
                  onSelectCustomer(customer);
                }
              }}
              disabled={loading}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pr-9 text-sm font-medium text-slate-800 outline-none transition hover:border-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                {loading
                  ? 'Loading customers...'
                  : '-- Select a customer --'}
              </option>

              {customers.map((customer) => (
                <option key={customer._id} value={customer._id}>
                  {customer.name} — {customer.email}
                </option>
              ))}
            </select>

            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>

        {selectedCustomer && (
          <div className="hidden items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 md:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Customer selected
          </div>
        )}
      </div>
    </div>
  );
}