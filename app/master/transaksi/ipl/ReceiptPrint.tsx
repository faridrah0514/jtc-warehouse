import React, { useImperativeHandle, forwardRef, useState } from 'react';
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
        fontFamily: 'Arial, sans-serif',
        border: '1px solid #000',
        color: '#0044cc'
      }}
    >
      <style>
        {`
          @media print {
            @page {
              size: 11cm 14cm;
              margin: 0;
            }
            body {
              -webkit-print-color-adjust: exact;
            }
          }
        `}
      </style>
      <Title level={5}>Pengelola</Title>
      <Text>Jambi Trade Centre</Text>
      <br />
      <Text>Jambi</Text>
      <hr style={{ margin: '8px 0', borderTop: '1px solid #0044cc' }} />

      <div style={{ border: '1px solid #0044cc', padding: '5px', textAlign: 'center', marginBottom: '15px' }}>
        <Title level={4} style={{ margin: 0, color: '#0044cc' }}>Iuran Pengelolaan Lingkungan</Title>
      </div>

      <div style={{ marginTop: '10px' }}>
        <Text>ID Pelanggan:</Text> <Text strong>{data.id_pelanggan}</Text> <br />
        <Text>Periode:</Text> <Text strong>{dayjs(data.periode, 'YYYY-MM').locale('id').format('MMMM YYYY')}</Text> <br />
        <Text>Nama Pelanggan:</Text> <Text strong>{data.nama_pelanggan}</Text> <br />
        <Text>Alamat:</Text> <Text strong>{data.alamat}</Text> <br />
        <Text>Jumlah:</Text> <Text strong>Rp. {_renderCurrency(data.jumlah)}</Text> <br />
        <Text>Terbilang:</Text> <Text strong>{data.terbilang}</Text> <br />
      </div>

      <div style={{ textAlign: 'right', marginTop: '20px' }}>
        <Text>Jambi, {dayjs().locale('id').format('DD MMMM YYYY')}</Text> <br />
        <Text>Admin</Text> <br />
        <div style={{ marginTop: '30px' }}>
          <Text>____________________</Text>
        </div>
      </div>
    </div>
  );
});

ReceiptPrint.displayName = 'ReceiptPrint';

export default ReceiptPrint;
