import { useEffect, useState } from 'react';
import { message } from 'antd';
import { CashFlowCategory } from '../types/master';

export const useFetchCategories = () => {
  const [categories, setCategories] = useState<CashFlowCategory[]>([]); // Initialize as empty array
  const [loading, setLoading] = useState(false);

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/finance/cashflow/categories`, {
        method: 'GET',
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('Failed to fetch categories');
      const result = await response.json();

      // Set categories safely
      setCategories(result.data || []);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      message.error(error.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  // Add new category
  const addCategory = async (category: Omit<CashFlowCategory, "id">) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/finance/cashflow/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category),
      });
      if (!response.ok) throw new Error("Failed to add category");
      await fetchCategories(); // Refresh categories after adding
      message.success("Category added successfully");
    } catch (error: any) {
      console.error("Error adding category:", error);
      message.error(error.message || "Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, loading, fetchCategories, addCategory };
};
