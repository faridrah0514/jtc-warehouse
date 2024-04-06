'use client'
import { DataAset } from '@/app/types/master';
import { Button, Descriptions, Space, Tabs } from 'antd';
import Title from 'antd/es/typography/Title';
import { Span } from 'next/dist/trace';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'

export default function Page({ params }: { params: { id: string } }) {
  const [asetData, setAsetData] = useState<any>();
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(true);
  console.log("params -> ", params.id)
  useEffect(
    () => {
      async function getData() {
        const response = await fetch(`/api/master/aset`, { method: 'GET', cache: 'no-store' })
        const data = await response.json()

        if (data) {
          setAsetData(data.data.filter(
            (value: DataAset) => value.id_aset == params.id
          )[0])
          console.log("data --> ", data)
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
        ]}
      >
      </Descriptions>

      <Title className='mt-5 mb-5' level={4}>Dokumen</Title>
      <Tabs type='card'
        items={
          asetData?.list_dir.map(
            (v: any, i: number) => {
              const file = asetData.list_dir_files.filter((value: any) => Object.keys(value) == v)[0]
              return {
                key: v,
                label: v,
                children: <>
                  <Link href={`/upload/docs/${asetData.id_aset}/${v}/${file[v]}`} target="_blank" rel="noopener noreferrer">
                    <Button type='link'>Open {file[v]}
                      {/* <Title level={4}>{file[v]}</Title> */}
                    </Button>
                  </Link>
                  <iframe
                    src={`/upload/docs/${asetData.id_aset}/${v}/${file[v]}`}
                    className='w-full h-full mt-5'
                    style={{ minHeight: '1000px' }}
                  ></iframe>
                </>
              }
            }
          )
        }
      >

      </Tabs>
    </>
  )
}
