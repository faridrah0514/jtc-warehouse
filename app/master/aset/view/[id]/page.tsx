'use client'
import { DataAset } from '@/app/types/master';
import { FilePdfOutlined, SnippetsOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Flex, Image, Modal, Space, Tabs } from 'antd';
import Title from 'antd/es/typography/Title';
import { Span } from 'next/dist/trace';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import path from "path";

export default function Page({ params }: { params: { id: string } }) {
  const [asetData, setAsetData] = useState<any>();
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(true);

  const [previewPdfUrl, setPreviewPdfUrl] = useState('');
  const [pdfPreviewVisible, setPdfPreviewVisible] = useState(false);

  const file_extension: string[] = ['.xlsx', '.xls', '.doc', '.docx', '.pdf']

  const handlePdfPreview = (pdfUrl: string) => {
    setPreviewPdfUrl(pdfUrl);
    setPdfPreviewVisible(true);
  };

  const handlePdfPreviewCancel = () => {
    setPdfPreviewVisible(false);
  };
  useEffect(
    () => {
      async function getData() {
        const response = await fetch(`/api/master/aset`, { method: 'GET', cache: 'no-store' })
        const data = await response.json()

        if (data) {
          setAsetData(data.data.filter(
            (value: DataAset) => value.id_aset == params.id
          )[0])
        }
      }
      getData()
    }, []
  )
  return (
    <>
      <Descriptions
        title='Aset Detail'
        size='small'
        bordered
        column={2}
        items={[
          {
            key: '1',
            label: 'Nama Aset',
            children: asetData?.nama_aset
          },
          {
            key: '2',
            label: 'ID Aset',
            children: asetData?.id_aset
          },
          {
            key: '3',
            label: 'Alamat',
            children: asetData?.alamat,
            span: { md: 2 }
          },
          {
            key: '4',
            label: 'Kota',
            children: asetData?.kota
          },
          {
            key: '5',
            label: 'Tipe Aset',
            children: asetData?.tipe_aset
          },
          {
            key: '6',
            label: 'No. Telepon',
            children: asetData?.no_tlp
          },
          {
            key: '7',
            label: 'No. Rek. Air',
            children: asetData?.no_rek_air
          },
          {
            key: '8',
            label: 'No. Rek. Listrik',
            children: asetData?.no_rek_listrik
          },
          {
            key: '9',
            label: 'No. PBB',
            children: asetData?.no_pbb
          },
          {
            key: '10',
            label: 'Tipe Sertifikat',
            children: asetData?.tipe_sertifikat
          },
          {
            key: '11',
            label: 'Tanggal Akhir HGB',
            children: asetData?.tanggal_akhir_hgb
          },
        ]}
      >
      </Descriptions>

      <Title className='mt-5 mb-5' level={4}>Dokumen</Title>
      <Tabs type='card'
        items={
          asetData?.list_dir.map(
            (v: any, i: React.Key) => {
              const file = asetData.list_dir_files.filter((value: any) => Object.keys(value) == v)[0]
              return {
                key: v,
                label: v,
                children: <div key={i}>
                  <Flex wrap='wrap' gap='middle'>
                    {file[v]
                      .filter((filename: string) => !filename.toLowerCase().startsWith('___pdf___'))
                      .map(
                        (filename: string, idx_filename: React.Key) => {
                          const filePath = `/upload/docs/${asetData.id_aset}/${v}/${filename}`;
                          const isPdf = filename.toLowerCase().startsWith('___pdf___');
                          const extension: string = path.extname(filename).toLowerCase()
                          return (
                            <>
                              <Card key={idx_filename} hoverable className='w-80 h-80 flex justify-center items-center'>
                                {
                                  file_extension.includes(extension) ?
                                    <Link href={filePath} target="_blank" rel="noopener noreferrer" className='flex flex-col justify-center items-center'>
                                      {extension == '.pdf' ? <FilePdfOutlined width={600} className='text-6xl' /> : <SnippetsOutlined width={600} className='text-6xl'></SnippetsOutlined>} <br />
                                      <Title level={5} className='text-blue-600'>{filename}</Title>
                                    </Link> : <div><Image alt={filePath} src={filePath} className='max-w-[14rem]'> TT</Image></div>
                                }
                              </Card>

                              {/* <Card key={idx_filename} hoverable className='w-80 h-80 flex justify-center items-center'>
                              {!isPdf ? (
                                <Link href={filePath} target="_blank" rel="noopener noreferrer" className='flex flex-col justify-center items-center'>
                                  <FilePdfOutlined width={600} className='text-6xl' /><br />
                                  <Title level={5} className='text-blue-600'>{filename}</Title>
                                </Link>
                              ) : ( 
                                <Image alt='' src={filePath} className='w-80 h-80'hidden/>
                              )}
                            </Card> */}

                              {/* {!isPdf ? (<Card key={idx_filename} hoverable className='w-80 h-80 flex justify-center items-center'>
                              <Link href={filePath} target="_blank" rel="noopener noreferrer" className='flex flex-col justify-center items-center'>
                                <FilePdfOutlined width={600} className='text-6xl' /><br />
                                <Title level={5} className='text-blue-600'>{filename}</Title>
                              </Link>
                            </Card>) : (<Card key={idx_filename} hoverable className='w-80 h-80 flex justify-center items-center'>

                              <Image alt='' src={filePath} className='w-80 h-80'hidden/>
                            </Card>)} */}
                            </>
                          )

                        }
                      )}
                  </Flex>
                </div>
              }
            }
          )
        }
      >

      </Tabs>
    </>
  )
}
