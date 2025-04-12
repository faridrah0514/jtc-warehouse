import React from 'react';
import { Typography, Table } from 'antd';
import dayjs from 'dayjs';
import { ColumnType } from 'antd/es/table';
import 'dayjs/locale/id';
const { Title, Text } = Typography;

interface PeriodReportProps {
  printedData: any;
  user: string;  // Add user as a prop
}

const PeriodReport = React.forwardRef<HTMLDivElement, PeriodReportProps>(({ printedData, user }, ref) => {

  // Helper function to format numbers as Indonesian Rupiah
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(amount);
  };


  const { period_date, report_type, ...filteredPrintedData } = printedData
  // Define columns for the table, including Saldo Awal (initial balance), Masuk (incoming), Keluar (outgoing), and Sisa (remaining)
  const columns: ColumnType<any>[] = [
    {
      title: 'Tanggal',
      dataIndex: 'date',
      key: 'date',
      width: 100,
      render: (text: string) => <Text>{dayjs(text).format('DD/MM/YYYY')}</Text>, // Format date
    },
    {
      title: 'No. Kategori',
      dataIndex: 'category_id',
      key: 'category_id',
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
      title: 'Masuk (Rp)',
      dataIndex: 'incoming',
      key: 'incoming',
      align: 'right',
      render: (amount: number, record: any) => record.category_type === 'incoming' ? formatCurrency(record.amount) : '-',
    },
    {
      title: 'Keluar (Rp)',
      dataIndex: 'outgoing',
      key: 'outgoing',
      align: 'right',
      render: (amount: number, record: any) => record.category_type === 'outgoing' ? formatCurrency(record.amount) : '-',
    },
    {
      title: 'Sisa (Rp)',
      dataIndex: 'remaining',
      key: 'remaining',
      align: 'right',
      render: (amount: number, record: any) => formatCurrency(record.remaining),
    }
  ];

  return (
    <div
      ref={ref}
      style={{
        paddingRight: '10px',
        paddingLeft: '10px',
        paddingBottom: '20px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div>
        {/* <Title level={3} style={{ textAlign: 'center', marginBottom: '30px' }}>
          Arus Kas
        </Title> */}

        {Object.entries(filteredPrintedData).map(([cabangId, cabangDetails]: [string, any], index: number, array) => (
          <div
            key={cabangId}
            style={{
              marginTop: '10px',
              marginBottom: '10px',
              pageBreakAfter: index !== array.length - 1 ? 'always' : 'auto',
            }}
          >
            {/* Cabang and Kota Section */}
            <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
              <Text strong>Cabang:</Text> <Text>{cabangDetails.nama_perusahaan}</Text>
              <br />
              <Text strong>Kota:</Text> <Text>{cabangDetails.kota}</Text>
            </div>

            {/* Period Section */}
            <Title level={3} style={{ textAlign: 'center', marginBottom: '-10px', paddingBottom: '2px' }}>
              Arus Kas
            </Title>
            <Title level={4} style={{ textAlign: 'center', marginBottom: '10px', marginTop: '0px' }}>
                {printedData.period_type === 'monthly' 
                  ? dayjs(printedData.period_date).locale('id').format('MMMM YYYY') 
                  : printedData.period_type === 'yearly'
                  ? dayjs(printedData.period_date).locale('id').format('YYYY')
                  : `${dayjs(printedData.period_date).locale('id').format('DD MMMM YYYY')}`}
            </Title>

            {/* Transactions Table */}
            <div style={{ marginBottom: '10px' }}>
              <Text strong >Saldo Awal: Rp {formatCurrency(cabangDetails.saldo_awal)}</Text>
            </div>

            <Table
              dataSource={cabangDetails.transactions}
              columns={columns}
              pagination={false}
              bordered
              size="small"
              summary={(pageData) => {
                let totalIncoming = 0;
                let totalOutgoing = 0;

                pageData.forEach(({ category_type, amount }) => {
                  if (category_type === 'incoming') {
                    totalIncoming += Number(amount) || 0;
                  } else if (category_type === 'outgoing') {
                    totalOutgoing += Number(amount) || 0;
                  }
                });

                const remainingBalance = cabangDetails.saldo_awal + totalIncoming - totalOutgoing;

                return (
                  <>
                    <Table.Summary.Row style={{ backgroundColor: '#fafafa' }}>
                      <Table.Summary.Cell index={0} colSpan={4}><Text strong>Total:</Text></Table.Summary.Cell>
                      <Table.Summary.Cell index={3} align="right">
                        <Text strong>{formatCurrency(totalIncoming)}</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4} align="right">
                        <Text strong>{formatCurrency(totalOutgoing)}</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={5} align="right">
                        <Text strong>{formatCurrency(remainingBalance)}</Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </>
                );
              }}
              rowKey={(record: any) => record.date + record.description}
            />
          </div>
        ))}
      </div>

      {/* Footer with User and Date */}
      <div className="print-footer">
        <Text style={{ fontSize: '10px', color: 'grey' }}>{user} - {dayjs().format('DD MMMM YYYY HH:mm')}</Text>
        {/* <br /> */}
        {/* <Text>{dayjs().format('DD MMMM YYYY HH:mm')}</Text> */}
        {/* <br /> */}
        {/* <Text>Hal: <span className="pageNumber"></span></Text> */}
      </div>

      {/* Print-specific styles */}
      <style jsx>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .print-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 1px 1px;
            text-align: right;
            font-size: 5px;
          }
          @page {
            size: A4;
            margin: 5mm;
          }
          .pageNumber:before {
            counter-increment: page;
            content: counter(page);
          }
        }
      `}</style>
    </div>
  );
});

PeriodReport.displayName = 'PeriodReport';

export default PeriodReport;
