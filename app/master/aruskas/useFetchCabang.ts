'use client'
import { useState, useEffect } from 'react';

export const useFetchCabang = () => {
  const [cabang, setCabang] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCabangData();
  }, []);

  const fetchCabangData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/master/cabang'); // Use the correct API endpoint
      const data = await response.json();
      // Ensure cabang data includes both `id` and `nama_perusahaan`
      setCabang(data.data || []);
    } catch (error) {
      console.error('Failed to fetch cabang:', error);
    } finally {
      setLoading(false);
    }
  };

  return { cabang, loading };
};
