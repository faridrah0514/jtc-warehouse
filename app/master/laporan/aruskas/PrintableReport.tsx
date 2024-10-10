import React, { forwardRef } from 'react';
import { Table, Typography } from 'antd';
import dayjs from 'dayjs';
import { _renderCurrency } from '../../../utils/renderCurrency';

const { Title, Text } = Typography;

// Props type for the PrintableReport
interface PrintableReportProps {
  printedData: {
    cabang: string;
    records: any[];
    total_incoming: number;
    total_outgoing: number;
    total_amount: number;
  }[];
}

const PrintableReport = forwardRef<HTMLDivElement, PrintableReportProps>(
  ({ printedData }, ref) => {
    // Define columns for the table based on the backend response
    // Define columns for the table based on the backend response
    const columns = [
      {
        title: 'No.',
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


    return (
      <div ref={ref} style={{ padding: '20px', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>
        {printedData.map((cabangData, index) => {
          const { cabang, records, total_incoming, total_outgoing, total_amount } = cabangData;

          // Add a row for the Net Total
          const dataSourceWithTotal = [
            ...records.map((item, idx) => ({
              ...item,
              index: idx + 1, // Ensure correct sequential numbering
            })),
            {
              key: 'net-total', // A unique key for the total row
              category: '', // Leave empty for merged columns
              description: '',
              date: '',
              amount: total_amount, // Display total amount in the last column
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
            <div key={index} style={{ pageBreakAfter: 'always', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
              {/* Cabang Header */}
              <div style={{ padding: '10px', borderBottom: '2px solid #1890ff', marginBottom: '15px' }}>
                <Title level={4} style={{ textAlign: 'center', marginBottom: '5px', color: '#1890ff' }}>
                  Cash Flow Report - {cabang}
                </Title>
                <Text style={{ textAlign: 'center', display: 'block', fontStyle: 'italic' }}>
                  {dayjs().format('DD MMMM YYYY')}
                </Text>
              </div>

              {/* Report Table */}
              <Table
                columns={columnsWithMergedCells}
                dataSource={dataSourceWithTotal}
                rowKey="id"
                size="small"
                pagination={false} // Remove pagination for printing
                bordered
                style={{ marginBottom: '20px' }}
              />

              {/* Summary Section */}
              <div style={{ backgroundColor: '#e6f7ff', padding: '10px', borderRadius: '4px', marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <Text strong>Total Incoming:</Text>
                  <Text>{_renderCurrency(total_incoming, false, false)}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <Text strong>Total Outgoing:</Text>
                  <Text>{_renderCurrency(total_outgoing, false, false)}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #1890ff', paddingTop: '5px' }}>
                  <Text strong style={{ fontSize: '16px' }}>Net Total:</Text>
                  <Text style={{ fontSize: '16px', fontWeight: 'bold' }}>{_renderCurrency(total_amount, false, false)}</Text>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
);

export default PrintableReport;
