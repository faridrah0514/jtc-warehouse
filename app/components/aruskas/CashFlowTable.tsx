import React, { useRef, useCallback } from 'react';
import { Table, Button, Popconfirm } from 'antd';
import { CashFlow, CashFlowCategory } from '@/app/types/master'; // Import CashFlow and CashFlowCategory types
import dayjs from 'dayjs'; // Import dayjs for date formatting
import { ColumnsType } from 'antd/es/table';
import { _renderCurrency } from '@/app/utils/renderCurrency';
import RoleProtected from '../roleProtected/RoleProtected';
import { useReactToPrint } from 'react-to-print';
import ReceiptPrint, { ReceiptPrintHandle } from '../../master/aruskas/ReceiptPrint'; // Import ReceiptPrint component
import 'dayjs/locale/id'; // Import Indonesian locale

interface CashFlowTableProps {
  data: CashFlow[];
  categories: CashFlowCategory[];
  loading: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
  onDelete: (id: number) => void;
  onEdit: (record: CashFlow) => void; // New prop for edit
  onAdd: () => void;
  title: "Kas Keluar" | "Kas Masuk";
}

const CashFlowTable: React.FC<CashFlowTableProps> = ({ data, categories, loading, currentPage, onPageChange, onDelete, onEdit, onAdd, title }) => {
  const pageSize = 100;
  const printRef = useRef<ReceiptPrintHandle | null>(null);

  // Helper function to get category name with ID
  const getCategoryDisplayName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? `${category.id} - ${category.name}` : 'Unknown';
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current?.print() || null,
    onAfterPrint: () => { 
      printRef.current?.setData(null);
    } 
  });

  const printReceipt = useCallback((record: CashFlow) => {
    if (printRef.current) {
      const rowNumber = ((currentPage - 1) * pageSize) + data.findIndex(item => item.id === record.id) + 1;
      const formattedNumber = rowNumber.toString().padStart(6, '0'); // Format to 6 digits with leading zeros
      printRef.current.setData({
        no: (formattedNumber),
        cabang: record.nama_perusahaan,

        // tanggal: dayjs().locale('id').format('DD MMMM YYYY HH:mm'),
        tanggal: record.date,
        items: [{ description: record.description, amount: record.amount }],
        total: record.amount,
        penerima: record.nama_toko || 'Unknown',
        title: title,
      });

      setTimeout(handlePrint, 0);
    }
  }, [handlePrint, currentPage, data, pageSize, title]);

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
      title: 'Nama Toko',
      dataIndex: 'nama_toko',
      key: 'nama_toko',
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
      dataIndex: 'files',
      key: 'files',
      render: (files: string[] | undefined, record: CashFlow) => {
        if (!files || files.length === 0) {
          return <span>No documents</span>;
        }
  
        // Return the list of files as clickable links
        return (
          <div>
            {files.map((file, index) => (
              <a
                key={index}
                href={`${record.folder_path}/${file}`} // Assuming folder_path contains the path to the file
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'block', marginBottom: '5px' }}
              >
                {file}
              </a>
            ))}
          </div>
        );
      },
    },
    {
      title: 'Tanggal Entri',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (created_at: string) => dayjs(created_at).format('DD-MM-YYYY')
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: CashFlow) => (
        <>
          <RoleProtected allowedRoles={['finance', 'admin']} actionType='edit' createdAt={record.created_at}>
            <Button type="link" onClick={() => onEdit(record)}>
              Edit
            </Button>
          </RoleProtected>
          {/* <RoleProtected allowedRoles={['finance', 'admin']} actionType='print'> */}
            <Button type="link" onClick={() => {
              printReceipt(record)
            }}>
              Print
            </Button>
          {/* </RoleProtected> */}
          <Popconfirm
            title="Are you sure to delete this record?"
            onConfirm={() => onDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <RoleProtected allowedRoles={['finance', 'admin']} actionType='delete' createdAt={record.created_at}>
              <Button type="link" danger>
                Delete
              </Button>
            </RoleProtected>
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
      <div style={{ display: 'none' }}>
        <ReceiptPrint ref={printRef} />
      </div>
    </div>
  );
};

export default CashFlowTable;
