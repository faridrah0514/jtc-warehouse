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
    <div
    id="receipt-print" 
    ref={printRef} style={{
      padding: '10px',
      width: '11cm',
      height: '14cm',
      paddingRight: '1.5cm',
      border: '1px solid #000',
      color: '#0044cc'
    }}>
      <style>
        {`
          #receipt-print .ant-typography {
            font-family: 'Times New Roman', Times, serif !important;
          }
          @media print {
            @page {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              size: 11cm 14cm;
              padding-right: 1.5cm;
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
        marginBottom: '10px'
      }}>
        <Text style={{ fontSize: '16px', fontWeight: 'bold', color: '#0044cc' }}>Tagihan Listrik</Text>
      </div>

      {/* Details Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '3.5cm 0.3cm auto',
        rowGap: '5px',
        paddingLeft: '5px',
        alignItems: 'start'
      }}>
        <Text>ID Pelanggan</Text>
        <Text>:</Text>
        <Text strong>{data.id_pelanggan}</Text>

        <Text>Periode</Text>
        <Text>:</Text>
        <Text strong>{data.periode}</Text>

        <Text>Nama Pelanggan</Text>
        <Text>:</Text>
        <Text strong>{data.nama_pelanggan}</Text>

        <Text>Alamat</Text>
        <Text>:</Text>
        <Text strong>{data.alamat}</Text>

        <Text>Tagihan</Text>
        <Text>:</Text>
        <Text strong>Rp. {data.tagihan?.toLocaleString('id-ID')}</Text>

        <Text>Terbilang</Text>
        <Text>:</Text>
        <Text strong>{data.terbilang}</Text>
      </div>

      {/* Footer Section */}
      <div style={{ textAlign: 'right', marginTop: '20px', paddingRight: '5px' }}>
        <Text>Jambi, {dayjs().format('DD-MM-YYYY')}</Text><br /><br /><br /><br />
        <Text>( Admin )</Text>
      </div>
    </div>
  );
});

ReceiptPrint.displayName = 'ReceiptPrint';

export default ReceiptPrint;
