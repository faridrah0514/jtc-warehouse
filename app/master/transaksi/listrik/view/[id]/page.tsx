'use client'
import { Button, Card, Descriptions, Typography } from 'antd';
import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs';
import { _renderCurrency } from '@/app/utils/renderCurrency';
const { Text } = Typography;
import { useRef } from 'react';
import generatePDF, { Resolution, Margin } from 'react-to-pdf';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';


const getTargetElement = () => document.getElementById('content-id');
export default function Page({ params }: { params: { id: string } }) {
  const [tagihanListrikData, setTagihanListrikData] = useState<any>();
  // const { toPDF, targetRef } = usePDF({filename: 'page.pdf'});
  // const targetRef = useRef();
  const options = {
    // default is `save`
    method: 'open',
    // default is Resolution.MEDIUM = 3, which should be enough, higher values
    // increases the image quality but also the size of the PDF, so be careful
    // using values higher than 10 when having multiple pages generated, it
    // might cause the page to crash or hang.
    resolution: Resolution.HIGH,
    page: {
       // margin is in MM, default is Margin.NONE = 0
       margin: Margin.SMALL,
       // default is 'A4'
       format: 'letter',
       // default is 'portrait'
       orientation: 'landscape',
    },
    canvas: {
       // default is 'image/jpeg' for better size performance
       mimeType: 'image/png',
       qualityRatio: 1
    },
    // Customize any value passed to the jsPDF instance and html2canvas
    // function. You probably will not need this and things can break, 
    // so use with caution.
    overrides: {
       // see https://artskydj.github.io/jsPDF/docs/jsPDF.html for more options
       pdf: {
          compress: true
       },
       // see https://html2canvas.hertzen.com/configuration for more options
       canvas: {
          useCORS: true
       }
    },
  };
  
  // const handleDownloadPDF = () => {
  //   const input = document.getElementById('content-id'); 
  //   // Specify the id of the element you want to convert to PDF
  //   html2canvas(input).then((canvas) => {
  //     const imgData = canvas.toDataURL('image/png');
  //     const pdf = new jsPDF();
  //     pdf.addImage(imgData, 'PNG', 0, 0);
  //     pdf.save('downloaded-file.pdf'); 
  //     // Specify the name of the downloaded PDF file
  //   });
  // };
  useEffect(
    () => {
      async function getData() {
        const response = await fetch(`/api/master/transaksi/listrik`, { method: 'GET', cache: 'no-store' })
        const data = await response.json()

        if (data) {
          setTagihanListrikData(data.data.filter(
            (value: any) => value.id == params.id
          ).map(
            (v: any) => {
              v.thn_bln_dayjs = dayjs(v.thn_bln, "MM-YYYY").format("MMMM YYYY")
              v.jumlah_pemakaian = v.meteran_akhir - v.meteran_awal
              v.total_tagihan_listrik = v.jumlah_pemakaian * v.kwh_rp
              return v
            }
          )[0])
        }
      }
      getData()
    }, []
  )
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center' }} id='content-id'>
        <Card title="Tagihan Listrik" style={{ width: 600 }}>
          <Descriptions
            size='small'
            bordered
            column={1}
            items={[
              { key: '1', label: 'Nama Pelanggan', children: tagihanListrikData?.nama_pelanggan },
              { key: '2', label: 'Nama Cabang', children: tagihanListrikData?.nama_cabang },
              { key: '3', label: 'Nama Aset', children: tagihanListrikData?.nama_aset },
              { key: '4', label: 'Alamat', children: tagihanListrikData?.alamat },
              { key: '5', label: 'Bulan / Tahun', children: tagihanListrikData?.thn_bln_dayjs },
              { key: '9', label: 'Tarif / Kwh', children: _renderCurrency(tagihanListrikData?.kwh_rp) },
              { key: '6', label: 'Meteran Awal', children: tagihanListrikData?.meteran_awal },
              { key: '7', label: 'Meteran Akhir', children: tagihanListrikData?.meteran_akhir },
              { key: '8', label: 'Jumlah Pemakaian', children: tagihanListrikData?.jumlah_pemakaian },
              { key: '10', label: 'Total Tagihan Listrik', children: <strong>{_renderCurrency(tagihanListrikData?.total_tagihan_listrik)}</strong> },
            ]}
          />
          <div className='pt-4'>
            <Text className={'mb-2'} style={{ display: 'block' }}>Tagihan di transfer ke rekening berikut:</Text>
            <Text style={{ display: 'block' }}>Bank {tagihanListrikData?.rek_bank_1.toUpperCase()} {tagihanListrikData?.rek_norek_1} a.n {tagihanListrikData?.rek_atas_nama_1}</Text>
            <Text style={{ display: 'block' }}>Bank {tagihanListrikData?.rek_bank_2.toUpperCase()} {tagihanListrikData?.rek_norek_2} a.n {tagihanListrikData?.rek_atas_nama_2}</Text>
          </div>
        </Card>
      </div>
      <div className={'pt-4'} style={{ display: 'flex', justifyContent: 'center' }}>
        {/* <Button type='primary' onClick={() => window.open(, '_blank')}>Download PDF / Print</Button> */}
      </div>
    </>
  )
}


