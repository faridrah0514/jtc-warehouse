import { useState } from 'react';
import { TipeAset, TipeSertifikat } from '../types'; // Adjust the path according to your directory

// Define the hook for fetching tipe aset and tipe sertifikat
export const useFetchTipeAsetSertifikat = () => {
  // Fetch Tipe Aset
  const fetchTipeAset = async (): Promise<TipeAset[]> => {
    try {
      const response = await fetch('/api/master/aset/tipe_aset', {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) throw new Error('Failed to fetch tipe aset');

      const data = await response.json();
      return data.data || [];
    } catch (error: any) {
      console.error(error.message);
      throw new Error('Failed to load tipe aset');
    }
  };

  // Fetch Tipe Sertifikat
  const fetchTipeSertifikat = async (): Promise<TipeSertifikat[]> => {
    try {
      const response = await fetch('/api/master/aset/tipe_sertifikat', {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) throw new Error('Failed to fetch tipe sertifikat');

      const data = await response.json();
      return data.data || [];
    } catch (error: any) {
      console.error(error.message);
      throw new Error('Failed to load tipe sertifikat');
    }
  };

  return { fetchTipeAset, fetchTipeSertifikat };
};
