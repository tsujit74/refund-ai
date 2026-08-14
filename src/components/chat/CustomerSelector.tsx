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
    <div className="p-4 border-b border-gray-200 bg-white">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Customer
      </label>
      <select
        value={selectedCustomer?._id || ''}
        onChange={(e) => {
          const customer = customers.find(c => c._id === e.target.value);
          if (customer) {
            onSelectCustomer(customer);
          }
        }}
        disabled={loading}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
      >
        <option value="">-- Select a customer --</option>
        {customers.map((customer) => (
          <option key={customer._id} value={customer._id}>
            {customer.name} ({customer.email})
          </option>
        ))}
      </select>
    </div>
  );
}