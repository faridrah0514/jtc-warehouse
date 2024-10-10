import React, { forwardRef } from 'react';
import { Table, Typography } from 'antd';
import dayjs from 'dayjs';
import { _renderCurrency } from '../../../utils/renderCurrency';

const { Title, Text } = Typography;

// Props type for the PrintableReport
interface PrintableReportProps {
  configurations: Record<string, any[]>; // Grouped data by nama_perusahaan
}

const PrintableReport = forwardRef<HTMLDivElement, PrintableReportProps>(
  ({ configurations }, ref) => {
    // Define columns for the table based on the backend response
    const columns = [
      {
        title: 'Nomor',
        dataIndex: 'index', // Use 'index' for sequential numbering
        key: 'index',
        render: (_: any, __: any, index: number) => index + 1, // Display sequential numbering for each record
      },
      {
        title: 'Category',
        dataIndex: 'category',
        key: 'category',
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
      },
      {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
        render: (date: string) => dayjs(date).format('DD-MM-YYYY'), // Format the date to DD-MM-YYYY
      },
      {
        title: 'Amount (Rp)',
        dataIndex: 'amount',
        key: 'amount',
        align: 'right' as 'right' | 'left' | 'center', // Align to the right for better financial representation
        render: (amount: number) => _renderCurrency(amount, false, false),
      },
    ];

    // Loop through each cabang group and create a table for each
    const renderedTables = Object.keys(configurations).map((cabang, index) => {
      const cabangData = Array.isArray(configurations[cabang]) ? configurations[cabang] : [];

      const totalIncoming = cabangData.reduce(
        (acc, record) => (record.category_type === 'incoming' ? acc + parseFloat(record.amount) : acc),
        0
      );

      const totalOutgoing = cabangData.reduce(
        (acc, record) => (record.category_type === 'outgoing' ? acc + parseFloat(record.amount) : acc),
        0
      );

      const totalAmount = totalIncoming - totalOutgoing;

      // Add a row for the Net Total
      const dataSourceWithTotal = [
        ...cabangData.map((item, idx) => ({
          ...item,
          index: idx + 1, // Ensure correct sequential numbering
        })),
        {
          key: 'net-total', // A unique key for the total row
          category: '', // Leave empty for merged columns
          description: '',
          date: '',
          amount: totalAmount, // Display total amount in the last column
        },
      ];

      // Adjust the rendering for the "Net Total" row
      const columnsWithMergedCells = columns.map((col, idx) => {
        if (col.dataIndex !== 'amount') {
          return {
            ...col,
            render: (text: any, record: any) => {
              // If it's the "Net Total" row, merge columns
              if (record.key === 'net-total') {
                return {
                  children: idx === 0 ? (
                    <div style={{ fontWeight: 'bold', textAlign: 'right' }}>Net Total:</div>
                  ) : null,
                  props: {
                    colSpan: idx === 0 ? columns.length - 1 : 0, // Merge all columns except the last one
                  },
                };
              }
              return text;
            },
          };
        }

        // Render the "amount" column normally, but make the "Net Total" row bold
        if (col.dataIndex === 'amount') {
          return {
            ...col,
            align: 'right' as 'right' | 'left' | 'center', // Explicitly set align to match AlignType
            render: (text: any, record: any) => {
              if (record.key === 'net-total') {
                return <div style={{ fontWeight: 'bold', borderTop: '2px solid #000' }}>{_renderCurrency(text, false, false)}</div>;
              }
              return _renderCurrency(text, false, false);
            },
          };
        }

        return col;
      });

      return (
        <div key={cabang} style={{ pageBreakAfter: 'always' }}>
          {/* Cabang Header */}
          <Title level={4} style={{ textAlign: 'center', marginBottom: '20px' }}>
            {cabang}
          </Title>

          {/* Report Table */}
          <Table
            columns={columnsWithMergedCells}
            dataSource={dataSourceWithTotal}
            rowKey="id"
            size="small"
            pagination={false} // Remove pagination for printing
            bordered
            style={{ marginBottom: '30px' }}
          />

          {/* Display Totals */}
          <div style={{ marginTop: '20px', textAlign: 'right', fontSize: '16px' }}>
            <Text strong style={{ marginRight: '20px' }}>Total Incoming:</Text>
            <Text>{_renderCurrency(totalIncoming, false, false)}</Text>
            <br />
            <Text strong style={{ marginRight: '20px' }}>Total Outgoing:</Text>
            <Text>{_renderCurrency(totalOutgoing, false, false)}</Text>
            <br />
            <Text strong style={{ marginRight: '20px', fontSize: '18px', borderTop: '2px solid #000', display: 'inline-block', paddingTop: '5px' }}>Net Total:</Text>
            <Text style={{ fontSize: '18px' }}>{_renderCurrency(totalAmount, false, false)}</Text>
          </div>
        </div>
      );
    });

    return (
      <div ref={ref} style={{ padding: '20px', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>
        {renderedTables}
      </div>
    );
  }
);

export default PrintableReport;
