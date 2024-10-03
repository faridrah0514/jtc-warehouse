import { useState } from 'react';
import { message } from 'antd';
import { CashFlow } from '../../types/master';
export const useFetchCashFlow = (type: 'incoming' | 'outgoing') => {
    const [data, setData] = useState<CashFlow[]>([]);
    const [loading, setLoading] = useState(false);
  
    const fetchCashFlow = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/finance/cashflow/${type}`, { method: 'GET', cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to fetch cash flow');
        const result = await response.json();
        setData(result.data || []);
      } catch (error: any) {
        message.error(error.message || 'Failed to load cash flow');
      } finally {
        setLoading(false);
      }
    };
  
    const deleteCashFlow = async (id: number) => {
      setLoading(true);
      try {
        const response = await fetch(`/api/finance/cashflow/${type}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
        const result = await response.json();
        if (response.ok && result.status === 200) {
          message.success(result.message);
          fetchCashFlow();
        } else {
          throw new Error(result.message || 'Failed to delete record');
        }
      } catch (error: any) {
        message.error(error.message || 'Failed to delete record');
      } finally {
        setLoading(false);
      }
    };
  
    return { data, loading, fetchCashFlow, deleteCashFlow };
  };