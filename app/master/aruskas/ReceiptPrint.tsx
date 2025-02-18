import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Typography } from 'antd';
import dayjs from 'dayjs';
import { _renderCurrency } from '@/app/utils/renderCurrency';
import "dayjs/locale/id";
dayjs.locale("id");

const { Text, Title } = Typography;

interface ReceiptData {
  no: string;
  cabang: string;
  tanggal: string;
  items: { description: string; amount: number | string }[];
  total: number | string;
  penerima: string;
  title: "Kas Keluar" | "Kas Masuk";
}

export interface ReceiptPrintHandle {
  setData: (data: ReceiptData | null) => void;
  print: () => HTMLDivElement | null;
}

const ReceiptPrint = forwardRef<ReceiptPrintHandle>((_, ref) => {
  const [data, setData] = useState<ReceiptData | null>(null);

  useImperativeHandle(ref, () => ({
    setData(newData: ReceiptData | null) {
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
        border: '1px solid #000',
        fontFamily: 'Arial, sans-serif',
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

      {/* Header Section */}
      <div style={{ textAlign: 'left', paddingBottom: '10px' }}>
        <div style={{ textAlign: 'right', marginTop: '-13px' }}>
          <Text style={{ fontSize: '5px' }}>
            {dayjs().format('DD MMMM YYYY HH:mm:ss')}
          </Text>
        </div>
        <Text style={{ fontWeight: 'bold' }}>CABANG: {data.cabang}</Text><br />
        <Text>{dayjs(data.tanggal).locale('id').format('DD MMMM YYYY')}</Text>
      </div>
      <div style={{ textAlign: 'center', padding: '10px 0' }}>
        <Title level={4} style={{ margin: 0 }}>
          {data.title === "Kas Masuk" ? "Bukti Pemasukan Kas" : "Bukti Pengeluaran Kas"}
        </Title>
        <hr style={{ margin: '4px 0', borderTop: '1px solid' }} />
        <Text>&lt;KK-{data.no}&gt;</Text>
      </div>

      {/* Items Section */}
      <div style={{ padding: '10px 0' }}>
        {data.items.map((item, index) => (
          <div key={index} style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '40px', paddingRight: '40px' }}>
            <div style={{ display: 'flex', flex: 1, marginRight: '20px' }}>
              <Text style={{ width: '25px' }}>{index + 1}.</Text>
              <Text style={{ flex: 1 }}>{item.description}</Text>
            </div>
            <Text style={{ minWidth: '120px', textAlign: 'right', flexShrink: 0 }}>
              {_renderCurrency(Number(item.amount))}
            </Text>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: '10px', paddingLeft: '40px', paddingRight: '40px' }}>
          <div style={{ marginLeft: '25px' }}>
            <Text>Total</Text>
          </div>
          <Text style={{ minWidth: '120px', textAlign: 'right', flexShrink: 0 }}>
            {_renderCurrency(Number(data.total))}
          </Text>
        </div>
      </div>

      {/* Footer Section */}
      <div style={{ paddingTop: '40px', paddingLeft: '40px', paddingRight: '40px' }}>
        <Text>Kepada : {data.penerima}</Text><br />
        <Text>Tanda Tangan:</Text>
        <div style={{ marginTop: '40px'}}>
          <Text>____________________</Text>
        </div>
      </div>
    </div>
  );
});

ReceiptPrint.displayName = 'ReceiptPrint';

export default ReceiptPrint;
