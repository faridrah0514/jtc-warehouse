'use client'
import React, { useEffect, useState } from 'react';
import { Table, Button, message, Popconfirm } from 'antd';
import { TipeSertifikat } from './types';
import { useFetchTipeAsetSertifikat } from './hooks/useFetchTipeAsetSertifikat';

const TipeSertifikatTable: React.FC = () => {
  const [tipeSertifikat, setTipeSertifikat] = useState<TipeSertifikat[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { fetchTipeSertifikat } = useFetchTipeAsetSertifikat();

  useEffect(() => {
    fetchTipeSertifikatData();
  }, []);

  const fetchTipeSertifikatData = async () => {
    setLoading(true);
    try {
      const data = await fetchTipeSertifikat();
      setTipeSertifikat(data);
    } catch (error) {
      message.error('Failed to load tipe sertifikat');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSertifikat = async (id: number) => {
    setLoading(true);
    try {
      const response = await fetch('/api/master/aset/tipe_sertifikat', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const result = await response.json();
      if (response.ok && result.status === 200) {
        message.success(result.message || 'Tipe Sertifikat deleted successfully');
        fetchTipeSertifikatData(); // Refresh the data
      } else {
        throw new Error(result.message || 'Failed to delete tipe sertifikat');
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to delete tipe sertifikat');
    } finally {
      setLoading(false);
    }
  };

  const pageSize = 10; // Define your page size

  const tipeSertifikatColumns = [
    {
      title: 'No',
      key: 'no',
      render: (_: any, __: any, index: number) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: 'Tipe Sertifikat',
      dataIndex: 'tipe_sertifikat',
      key: 'tipe_sertifikat',
    },
    {
      title: 'Masa Berlaku',
      dataIndex: 'masa_berlaku',
      key: 'masa_berlaku',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: TipeSertifikat) => (
        <Popconfirm
          title="Are you sure to delete this tipe sertifikat?"
          onConfirm={() => handleDeleteSertifikat(record.id)}
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
      <h1 className="text-2xl font-semibold">Data Tipe Sertifikat</h1>
      <Table
        columns={tipeSertifikatColumns}
        dataSource={tipeSertifikat}
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

export default TipeSertifikatTable;
