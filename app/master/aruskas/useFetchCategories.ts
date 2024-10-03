import { useState } from 'react';
import { message } from 'antd';
import { CashFlowCategory } from '../../types/master';

export const useFetchCategories = () => {
  const [categories, setCategories] = useState<CashFlowCategory[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/finance/cashflow/categories`, { method: 'GET', cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to fetch categories');
      const result = await response.json();
      setCategories(result.data || []);
    } catch (error: any) {
      message.error(error.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  // Add new category
  const addCategory = async (category: Omit<CashFlowCategory, 'id'>) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/finance/cashflow/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });
      if (!response.ok) throw new Error('Failed to add category');
      await fetchCategories(); // Refresh categories after adding
      message.success('Category added successfully');
    } catch (error: any) {
      message.error(error.message || 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  return { categories, loading, fetchCategories, addCategory };
};
