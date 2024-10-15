import React from 'react';
import { Table, Button, Popconfirm } from 'antd';
import { CashFlow, CashFlowCategory } from '@/app/types/master'; // Import CashFlow and CashFlowCategory types
import { ColumnsType } from 'antd/es/table';
import { _renderCurrency } from '@/app/utils/renderCurrency';

interface CashFlowTableProps {
  data: CashFlow[];
  categories: CashFlowCategory[];
  loading: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
  onDelete: (id: number) => void;
  onEdit: (record: CashFlow) => void; // New prop for edit
  onAdd: () => void;
  title: string;
}

const CashFlowTable: React.FC<CashFlowTableProps> = ({ data, categories, loading, currentPage, onPageChange, onDelete, onEdit, onAdd, title }) => {
  const pageSize = 10;

  // Helper function to get category name with ID
  const getCategoryDisplayName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? `${category.id} - ${category.name}` : 'Unknown';
  };

  const columns: ColumnsType<CashFlow> = [
    {
      title: 'No',
      key: 'no',
      render: (_: any, __: any, index: number) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: 'Nama Cabang',
      dataIndex: 'nama_perusahaan',
      key: 'nama_perusahaan',
    },
    {
      title: 'Kategori',
      key: 'category',
      render: (text: any, record: CashFlow) => getCategoryDisplayName(record.category_id),
    },
    {
      title: 'Keterangan',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Jumlah',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => _renderCurrency(amount),
    },
    {
      title: 'Tanggal',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => {
        const formattedDate = new Date(date).toLocaleDateString('en-GB'); // Format date to DD-MM-YYYY
        return formattedDate;
      },
    },
    {
      title: 'Dokumen',
      dataIndex: 'document',
      key: 'document',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: CashFlow) => (
        <>
          <Button type="link" onClick={() => onEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete this record?"
            onConfirm={() => onDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <Button type="primary" onClick={onAdd}>
          + Tambah Data
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: pageSize,
          onChange: onPageChange,
        }}
        size="small"
        scroll={{ x: 'max-content' }} // Add horizontal scroll
      />
    </div>
  );
};

export default CashFlowTable;
