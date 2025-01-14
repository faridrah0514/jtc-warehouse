import React from 'react';
import { Typography, Table } from 'antd';
import { ColumnType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface CategoryReportProps {
    printedData: any;
    user: string;  // Add user as a prop
}

const CategoryReport = React.forwardRef<HTMLDivElement, CategoryReportProps>(({ printedData, user }, ref) => {

    // Helper function to format numbers as Indonesian Rupiah
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(amount);
    };

    const { period_date, report_type, ...filteredPrintedData } = printedData;

    // Define columns for the table
    const columns: ColumnType<any>[] = [
        {
            title: 'Tanggal',
            dataIndex: 'date',
            key: 'date',
            width: '20%',
            render: (text: string) => (
                <Text>{new Date(text).toLocaleDateString('id-ID')}</Text>
            ),
        },
        {
            title: 'Nama Toko',
            dataIndex: 'nama_toko',
            key: 'nama_toko',
            width: '20%',
            render: (text: string) => (
                <Text>{text}</Text>
            ),
        },
        {
            title: 'Keterangan',
            dataIndex: 'description',
            key: 'description',
            render: (_: any, record: any) => (
                <Text>{record.description}</Text>
            ),
            width: '40%',
        },
        {
            title: 'Jumlah (Rp)',
            dataIndex: 'amount',
            key: 'amount',
            align: 'right',
            width: '20%',
            render: (amount: number) => <Text>{formatCurrency(amount)}</Text>,
        },
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
                            <Text strong>{cabangDetails.nama_perusahaan}</Text>
                            <br />
                            <Text strong>{cabangDetails.kota}</Text>
                        </div>

                        {/* Category Section */}
                        <div style={{ marginBottom: '10px' }}>
                            <Title level={3} style={{ textAlign: 'center', marginBottom: '10px' }}>
                                {Array.from(new Set(cabangDetails.transactions?.map((trans: any) => `${trans.category_id}-${trans.category_name}`))).join(', ')}
                            </Title>
                        </div>

                        {/* Period Date */}
                        <div style={{ marginBottom: '5px' }}>
                            <Title level={3} style={{ textAlign: 'center', marginBottom: '10px' }}>
                                {printedData.period_type === 'daily' 
                                    ? dayjs(printedData.period_date).locale('id').format('DD MMMM YYYY') 
                                    : printedData.period_type === 'monthly' 
                                    ? dayjs(printedData.period_date).locale('id').format('MMMM YYYY') 
                                    : dayjs(printedData.period_date).locale('id').format('YYYY')}
                            </Title>
                        </div>

                        {/* Transactions Table */}
                        <Table
                            dataSource={cabangDetails.transactions}
                            columns={columns}
                            pagination={false}
                            bordered
                            size='small'
                            summary={() => (
                                <Table.Summary.Row style={{ backgroundColor: '#fafafa' }}>
                                    <Table.Summary.Cell index={0} align='right' colSpan={3}><Text strong>Total:</Text></Table.Summary.Cell>
                                    <Table.Summary.Cell index={2} align="right">
                                        <Text strong>{cabangDetails.total_amount?.toLocaleString('id-ID')}</Text>
                                    </Table.Summary.Cell>
                                </Table.Summary.Row>
                            )}
                            rowKey={(record: any) => record.date + record.description}
                        />
                    </div>
                ))}
            </div>

            {/* Footer with User and Date */}
            <div className="print-footer">
                <Text style={{ fontSize: '10px', color: 'grey' }}>{user} - {dayjs().format('DD MMMM YYYY, HH:mm')}</Text>
                {/* <br /> */}
                {/* <Text style={{ fontSize: '10px', color: 'grey' }}>{dayjs().format('DD MMMM YYYY')}</Text> */}
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
                }
            `}</style>
        </div>
    );
});

CategoryReport.displayName = 'CategoryReport';

export default CategoryReport;
