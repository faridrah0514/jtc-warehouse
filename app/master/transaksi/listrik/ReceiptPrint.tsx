// ReceiptPrint.tsx
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Typography } from 'antd';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

interface TransactionData {
  id_pelanggan: string;
  periode: string;
  nama_pelanggan: string;
  alamat: string;
  tagihan: number;
  terbilang: string;
}

export interface ReceiptPrintHandle {
  setData: (data: TransactionData) => void;
  print: () => HTMLDivElement | null;
}

const ReceiptPrint = forwardRef<ReceiptPrintHandle>((_, ref) => {
  const [data, setData] = useState<TransactionData | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    setData(newData: TransactionData) {
      setData(newData);
    },
    print() {
      return printRef.current;
    },
  }));

  if (!data) return null;

  return (
    <div ref={printRef} style={{
      padding: '10px',
      width: '11cm',
      height: '14cm',
      fontFamily: 'Arial, sans-serif',
      border: '1px solid #000',
      color: '#0044cc'
    }}>
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
      <div style={{ textAlign: 'left', paddingBottom: '10px' }}>
        <Text style={{ fontWeight: 'bold' }}>Pengelola</Text><br />
        <Text style={{ fontWeight: 'bold' }}>Jambi Trade Center</Text><br />
        <Text style={{ fontWeight: 'bold' }}>Jambi</Text>
      </div>

      <div style={{
        textAlign: 'center',
        border: '1px solid #0044cc',
        padding: '5px',
        marginBottom: '10px'
      }}>
        <Text style={{ fontSize: '16px', fontWeight: 'bold', color: '#0044cc' }}>Tagihan Listrik</Text>
      </div>

      <div style={{ paddingLeft: '5px' }}>
        <Text>ID Pelanggan</Text>: <Text strong>{data.id_pelanggan}</Text><br />
        <Text>Periode</Text>: <Text strong>{data.periode}</Text><br />
        <Text>Nama Pelanggan</Text>: <Text strong>{data.nama_pelanggan}</Text><br />
        <Text>Alamat</Text>: <Text strong>{data.alamat}</Text><br />
        <Text>Tagihan</Text>: <Text strong>Rp. {data.tagihan?.toLocaleString('id-ID')}</Text><br />
        <Text>Terbilang</Text>: <Text strong>{data.terbilang}</Text><br />
      </div>

      <div style={{ textAlign: 'right', marginTop: '20px', paddingRight: '5px' }}>
        <Text>Jambi, {dayjs().format('DD-MM-YYYY')}</Text><br /><br />
        <Text>( Admin )</Text>
      </div>
    </div>
  );
});

ReceiptPrint.displayName = 'ReceiptPrint';

export default ReceiptPrint;
