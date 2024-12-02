// ReceiptPrint.tsx (Alternative Version)
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Typography } from 'antd';
import dayjs from 'dayjs';
import { _renderCurrency } from '@/app/utils/renderCurrency';

const { Text, Title } = Typography;

interface ReceiptData {
  id_pelanggan: string;
  periode: string;
  nama_pelanggan: string;
  alamat: string;
  jumlah: number;
  terbilang: string;
}

export interface ReceiptPrintHandle {
  setData: (data: ReceiptData) => void;
  print: () => HTMLDivElement | null;
}

const ReceiptPrint = forwardRef<ReceiptPrintHandle>((_, ref) => {
  const [data, setData] = useState<ReceiptData | null>(null);

  useImperativeHandle(ref, () => ({
    setData(newData: ReceiptData) {
      setData(newData);
    },
    print() {
      return document.querySelector('#receipt-print') as HTMLDivElement | null;
    },
  }));

  if (!data) return null;

  return (
    <div
      id="receipt-print"
      style={{
        padding: '10px',
        width: '11cm',
        height: '14cm',
        paddingRight: '1.5cm',
        border: '1px solid #000',
        color: '#0044cc'
      }}
    >
      <style>
        {`
          #receipt-print .ant-typography {
            font-family: 'Times New Roman', Times, serif !important;
          }
          @media print {
            @page {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              padding-right: 1.5cm;
              size: 11cm 14cm;
              margin: 0;
            }
            body {
              -webkit-print-color-adjust: exact;
            }
          }
        `}
      </style>

      {/* Header Section */}
      <div style={{ textAlign: 'left', paddingBottom: '10px' }}>
        <Text style={{ fontWeight: 'bold' }}>Pengelola</Text><br />
        <Text style={{ fontWeight: 'bold' }}>Jambi Trade Center</Text><br />
        <Text style={{ fontWeight: 'bold' }}>Jambi</Text>
      </div>
      <hr style={{ margin: '8px 0', borderTop: '1px solid #0044cc' }} />

      {/* Title Section */}
      <div style={{
        textAlign: 'center',
        border: '1px solid #0044cc',
        padding: '5px',
        marginBottom: '15px'
      }}>
        <Title level={4} style={{ margin: 0, color: '#0044cc' }}>Iuran Pengelolaan Lingkungan</Title>
      </div>

      {/* Details Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '3.5cm 0.3cm auto',
        rowGap: '5px',
        alignItems: 'start'
      }}>
        <Text>ID Pelanggan</Text>
        <Text>:</Text>
        <Text strong>{data.id_pelanggan}</Text>

        <Text>Periode</Text>
        <Text>:</Text>
        <Text strong>{dayjs(data.periode, 'YYYY-MM').locale('id').format('MMMM YYYY')}</Text>

        <Text>Nama Pelanggan</Text>
        <Text>:</Text>
        <Text strong>{data.nama_pelanggan}</Text>

        <Text>Alamat</Text>
        <Text>:</Text>
        <Text strong>{data.alamat}</Text>

        <Text>Jumlah</Text>
        <Text>:</Text>
        <Text strong>{_renderCurrency(data.jumlah)}</Text>

        <Text>Terbilang</Text>
        <Text>:</Text>
        <Text strong>{data.terbilang}</Text>
      </div>

      {/* Footer Section */}
      <div style={{ textAlign: 'right', marginTop: '20px' }}>
        <Text>Jambi, {dayjs().locale('id').format('DD MMMM YYYY')}</Text> <br />
        <Text>Admin</Text> <br /><br />
        <div style={{ marginTop: '30px' }}>
          <Text>____________________</Text>
        </div>
      </div>
    </div>
  );
});

ReceiptPrint.displayName = 'ReceiptPrint';

export default ReceiptPrint;
