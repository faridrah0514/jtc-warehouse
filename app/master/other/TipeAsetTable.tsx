'use client'
import React, { useEffect, useState } from 'react';
import { Table, Button, message, Popconfirm } from 'antd';
import { TipeAset } from './types';
import { useFetchTipeAsetSertifikat } from './hooks/useFetchTipeAsetSertifikat';

const TipeAsetTable: React.FC = () => {
  const [tipeAset, setTipeAset] = useState<TipeAset[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { fetchTipeAset } = useFetchTipeAsetSertifikat();

  useEffect(() => {
    fetchTipeAsetData();
  }, []);

  const fetchTipeAsetData = async () => {
    setLoading(true);
    try {
      const data = await fetchTipeAset();
      setTipeAset(data);
    } catch (error) {
      message.error('Failed to load tipe aset');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAset = async (id: number) => {
    setLoading(true);
    try {
      const response = await fetch('/api/master/aset/tipe_aset', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const result = await response.json();
      if (response.ok && result.status === 200) {
        message.success(result.message || 'Tipe Aset deleted successfully');
        fetchTipeAsetData(); // Refresh the data
      } else {
        throw new Error(result.message || 'Failed to delete tipe aset');
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to delete tipe aset');
    } finally {
      setLoading(false);
    }
  };

  const pageSize = 10; // Define your page size

  const tipeAsetColumns = [
    {
      title: 'No',
      key: 'no',
      render: (_: any, __: any, index: number) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: 'Tipe Aset',
      dataIndex: 'tipe_aset',
      key: 'tipe_aset',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: TipeAset) => (
        <Popconfirm
          title="Are you sure to delete this tipe aset?"
          onConfirm={() => handleDeleteAset(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="link" danger>
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold">Data Tipe Aset</h1>
      <Table
        columns={tipeAsetColumns}
        dataSource={tipeAset}
        rowKey="id"
        loading={loading}
        size="small" 
        pagination={{
          pageSize,
          onChange: (page) => setCurrentPage(page),
        }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default TipeAsetTable;
