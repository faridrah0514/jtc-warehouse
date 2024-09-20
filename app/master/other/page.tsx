'use client';

import React, { useEffect, useState } from 'react';
import { Table, Button, message, Popconfirm, Row, Col } from 'antd';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface TipeAset {
  id: number;
  tipe_aset: string;
}

interface TipeSertifikat {
  id: number;
  tipe_sertifikat: string;
  masa_berlaku: number;
}

const Page: React.FC = () => {
  const [tipeAset, setTipeAset] = useState<TipeAset[]>([]);
  const [tipeSertifikat, setTipeSertifikat] = useState<TipeSertifikat[]>([]);
  const [loading, setLoading] = useState(false);
  const [asetCurrentPage, setAsetCurrentPage] = useState(1);
  const [sertifikatCurrentPage, setSertifikatCurrentPage] = useState(1);
  const { data: session } = useSession();
  const router = useRouter();

  const currentUserRole = session?.user?.role;

  useEffect(() => {
    fetchTipeAset();
    fetchTipeSertifikat();
  }, []);

  const fetchTipeAset = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/master/aset/tipe_aset', { method: 'GET', cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to fetch tipe aset');
      const data = await response.json();
      setTipeAset(data.data || []);
    } catch (error: any) {
      message.error(error.message || 'Failed to load tipe aset');
    } finally {
      setLoading(false);
    }
  };

  const fetchTipeSertifikat = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/master/aset/tipe_sertifikat', { method: 'GET', cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to fetch tipe sertifikat');
      const data = await response.json();
      setTipeSertifikat(data.data || []);
    } catch (error: any) {
      message.error(error.message || 'Failed to load tipe sertifikat');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (table: string, id: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/master/aset/${table}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const result = await response.json();
      if (response.ok && result.status === 200) {
        message.success(result.message);
        if (table === 'tipe_aset') {
          fetchTipeAset();
        } else {
          fetchTipeSertifikat();
        }
      } else {
        throw new Error(result.message || 'Failed to delete record');
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to delete record');
    } finally {
      setLoading(false);
    }
  };

  const pageSize = 100; // Set your desired page size

  const tipeAsetColumns = [
    {
      title: 'No',
      key: 'no',
      render: (_: any, __: any, index: number) => (asetCurrentPage - 1) * pageSize + index + 1,
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
        <div className="flex">
          <Popconfirm
            title="Are you sure to delete this tipe aset?"
            onConfirm={() => handleDelete('tipe_aset', record.id)}
            okText="Yes"
            cancelText="No"
            disabled={currentUserRole !== 'admin'}
          >
            <Button type="link" danger disabled={currentUserRole !== 'admin'}>
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const tipeSertifikatColumns = [
    {
      title: 'No',
      key: 'no',
      render: (_: any, __: any, index: number) => (sertifikatCurrentPage - 1) * pageSize + index + 1,
    },
    {
      title: 'Tipe Sertifikat',
      dataIndex: 'tipe_sertifikat',
      key: 'tipe_sertifikat',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: TipeSertifikat) => (
        <div className="flex">
          <Popconfirm
            title="Are you sure to delete this tipe sertifikat?"
            onConfirm={() => handleDelete('tipe_sertifikat', record.id)}
            okText="Yes"
            cancelText="No"
            disabled={currentUserRole !== 'admin'}
          >
            <Button type="link" danger disabled={currentUserRole !== 'admin'}>
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-100">
      <Row gutter={24}>
        <Col xs={24} md={12}>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between mb-4">
              <h1 className="text-2xl font-semibold">Data Tipe Aset</h1>
            </div>
            <Table
              columns={tipeAsetColumns}
              dataSource={tipeAset}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: pageSize,
                onChange: (page) => setAsetCurrentPage(page),
              }}
              size="small"
            />
          </div>
        </Col>

        <Col xs={24} md={12}>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between mb-4">
              <h1 className="text-2xl font-semibold">Data Tipe Sertifikat</h1>
            </div>
            <Table
              columns={tipeSertifikatColumns}
              dataSource={tipeSertifikat}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: pageSize,
                onChange: (page) => setSertifikatCurrentPage(page),
              }}
              size="small"
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Page;
