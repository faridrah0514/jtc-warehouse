import React from 'react';
import { Table } from 'antd';

interface ReportTableProps {
  data: any[];
}

export const ReportTable: React.FC<ReportTableProps> = ({ data }) => {
  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => <span>{amount}</span>, // Format as needed
    },
  ];

  return (
    <Table
      dataSource={data}
      columns={columns}
      rowKey="id" // Ensure this key is unique
    />
  );
};
