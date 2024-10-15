import { useState } from 'react';
import { CashFlowCategory } from '@/app/types/master'; // Adjust the path according to your directory

export const useFetchCategories = () => {
  // Fetch Categories
  const fetchCategories = async (): Promise<CashFlowCategory[]> => {
    try {
      const response = await fetch('/api/finance/cashflow/categories', {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) throw new Error('Failed to fetch categories');

      const data = await response.json();
      return data.data || []; // Assuming the response structure includes { data: [...] }
    } catch (error: any) {
      console.error(error.message);
      throw new Error('Failed to load categories');
    }
  };

  // Add Category
  const addCategory = async (category: Omit<CashFlowCategory, 'id'>) => {
    try {
      const response = await fetch('/api/finance/cashflow/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });

      if (!response.ok) throw new Error('Failed to add category');

      return await response.json();
    } catch (error: any) {
      console.error(error.message);
      throw new Error('Failed to add category');
    }
  };

  // Update Category
  const updateCategory = async (id: string, category: Omit<CashFlowCategory, 'id'>) => {
    try {
      const response = await fetch(`/api/finance/cashflow/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });

      if (!response.ok) throw new Error('Failed to update category');

      return await response.json();
    } catch (error: any) {
      console.error(error.message);
      throw new Error('Failed to update category');
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const response = await fetch(`/api/finance/cashflow/categories/${id}`, {
        method: 'DELETE',
      });
  
      // Return the raw response to allow further handling
      return response;
    } catch (error: any) {
      console.error(error.message);
      throw new Error('Failed to delete category');
    }
  };

  return { fetchCategories, addCategory, updateCategory, deleteCategory };
};
