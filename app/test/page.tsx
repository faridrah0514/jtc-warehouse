'use client'
import React, { useRef, useState } from 'react';
import { Button, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { useReactToPrint } from 'react-to-print';

const { RangePicker } = DatePicker;
const dateFormat = 'YYYY/MM/DD';

const Page = () => {
  const componentRef = useRef<HTMLDivElement>(null);
  const [a, setA] = useState<string>('');

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onBeforeGetContent: () => {
      return new Promise<void>((resolve) => {
        setA('bijiiii');
        resolve();
      });
    },
  });

  return (
    <>
      <Button onClick={handlePrint}>Print</Button>
      <div ref={componentRef}>
        <div className="print-only">
          elelelelelelel {a}
        </div>
        <RangePicker />
        <RangePicker
          defaultValue={[dayjs('2015/01/01', dateFormat), dayjs('2015/01/01', dateFormat)]}
          format={dateFormat}
        />
      </div>
      <style jsx>{`
        .print-only {
          display: none;
        }

        @media print {
          .print-only {
            display: block;
          }

          .no-print {
            display: none;
          }
        }
      `}</style>
    </>
  );
}

export default Page;
