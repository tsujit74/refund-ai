'use client';

import { useEffect, useState } from 'react';

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const response = await fetch('/api/customers');

        if (!response.ok) {
          throw new Error('Failed to fetch customers');
        }

        const data = await response.json();

        setCustomers(data.customers);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Unknown error'
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCustomers();
  }, []);

  return { customers, loading, error };
}