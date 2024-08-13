'use client'
import React, { useEffect, useState } from 'react'

import { Button, ConfigProvider, Flex, Form, Popconfirm, Table, TableProps, Tag } from 'antd'
import { DataCabang } from '@/app/types/master'
import Title from 'antd/es/typography/Title'
import dayjs from 'dayjs';
import Link from 'next/link'
import AddListrikModalV2 from './AddListrikModalV2'


const column = [
  { title: "Bln/Thn", dataIndex: 'bln_thn', key: 'bln_thn' },
  { title: "Meteran Awal", dataIndex: 'meteran_awal', key: 'meteran_awal' },
  { title: "Meteran Akhir", dataIndex: 'meteran_akhir', key: 'meteran_akhir' },
]

const columnSewa = [
  { title: "Nomor", dataIndex: 'no', key: 'no' },
  { title: "Cabang", dataIndex: 'nama_cabang', key: 'nama_cabang' },
  { title: "Aset", dataIndex: 'nama_aset', key: 'nama_aset' },
  { title: "Pelanggan", dataIndex: 'nama_pelanggan', key: 'nama_pelanggan' },
  { title: "Tanggal Awal Sewa", dataIndex: 'start_date_sewa', key: 'start_date_sewa' },
  { title: "Tanggal Akhir Sewa", dataIndex: 'end_date_sewa', key: 'end_date_sewa' },
]
export default function Page() {

  const [tagihanListrikData, setTagihanListrik] = useState<any[]>([]);
  const [dataSewa, setDataSewa] = useState<any[]>([])
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(true);
  const [isEdit, setIsEdit] = useState<boolean>(false)
  const [form] = Form.useForm()
  const [statusSewa, setStatusSewa] = useState<string>('')

  async function getData() {
    const response = await fetch('/api/master/transaksi/listrik', { method: 'GET', cache: 'no-store' })
    const sewa = await fetch('/api/master/transaksi/sewa', { method: 'GET', cache: 'no-store' })
    const dataSewa = await sewa.json()
    const data = await response.json()
    const today = dayjs() 
    if (data) {
      data.data.map((v: any, i: number) => {
        v.no = i + 1
        return v
      })
      setTagihanListrik(data.data)
    }
    if (dataSewa) {
      dataSewa.data.map((v: any, i: number) => {
        v.no = i + 1
        if (dayjs(v.start_date_sewa, "DD-MM-YYYY") > today)
          // { setStatusSewa('akanDatang'); return <Tag color='processing'>Akan Datang</Tag>}
          v.statusSewa = 'Akan Datang'
        else if (dayjs(v.start_date_sewa, "DD-MM-YYYY") <= today && today <= dayjs(v.end_date_sewa, "DD-MM-YYYY"))
          // { setStatusSewa('aktif'); return <Tag color='success'>Aktif</Tag>}
          v.statusSewa = 'Aktif'
        else
          // { setStatusSewa('nonAktif'); return <Tag color='default'>Non-Aktif</Tag>} 
          v.statusSewa = 'Non-Aktif'
        return v
      })
      setDataSewa(dataSewa.data.filter((value: any) => value.is_pln == 0))
    }
  }

  useEffect(
    () => {
      getData()
    }, [triggerRefresh]
  )
  return (
    <>
      <Title level={3}>Halaman Data Master Transaksi - Listrik</Title>
      <AddListrikModalV2 form={form} isEdit={isEdit} setOpenModal={setOpenModal} openModal={openModal} triggerRefresh={triggerRefresh} setTriggerRefresh={setTriggerRefresh} tagihanListrik={tagihanListrikData} />
      <Table className='overflow-auto' size='small'
        columns={[
          ...columnSewa,
          {
            title: "Status Sewa",
            key: "status_sewa",
            render: (_, record: any) => {
              const today = dayjs() 
              return (<Tag color={(record.statusSewa == 'Aktif') ? 'success' : (record.statusSewa == 'Akan Datang') ? 'processing' : 'default'}>{record.statusSewa}</Tag>)
              // if (dayjs(record.start_date_sewa, "DD-MM-YYYY") > today)
              // { setStatusSewa('akanDatang'); return <Tag color='processing'>Akan Datang</Tag>}
              // else if (dayjs(record.start_date_sewa, "DD-MM-YYYY") <= today && today <= dayjs(record.end_date_sewa, "DD-MM-YYYY"))
              // { setStatusSewa('aktif'); return <Tag color='success'>Aktif</Tag>}
              // else
              // { setStatusSewa('nonAktif'); return <Tag color='default'>Non-Aktif</Tag>} 
            }
          },
          {
            title: "Action",
            key: "action",
            render: (_, record: any) => (
              <Flex gap="small">
                <Button type="primary" ghost size="small" disabled={(record.statusSewa == 'Aktif') ? false: true} onClick={
                  () => {
                    setOpenModal(true)
                    setIsEdit(false)
                    form.setFieldsValue(record)
                    setTriggerRefresh(!triggerRefresh)
                  }
                }>
                  + Transaksi Tagihan Listrik
                </Button>
              </Flex>
            ),
          }
        ]}
        dataSource={dataSewa.map((item: any, index: number) => ({ ...item, key: index }))}
        expandable={{
          // fixed:'left',
          expandedRowRender: (record) => {
            // const columns = [
            //   {
            //     title: 'Jenis Dokumen', dataIndex: 'fileType', key: 'fileType',
            //   },
            // ]
            return <Table size='small' columns={[
              ...column,
              {
                title: "Action",
                key: "action",
                render: (_, record: any) => (
                  <Flex gap="small">
                    <ConfigProvider
                      theme={{
                        components: {
                          Button: {
                            colorPrimary: '#00b96b',
                            colorPrimaryHover: '#00db7f'
                          }
                        }
                      }}
                    >
                      <Button type="primary" ghost size="small">
                        <Link href={`/master/transaksi/listrik/view/${record.id}`}>
                          View
                        </Link>
                      </Button>
                    </ConfigProvider>
                    <Button type="primary" ghost size="small" onClick={
                      () => {
                        setOpenModal(true)
                        setIsEdit(true)
                        record.bln_thn = dayjs(record.bln_thn, 'MM-YYYY')
                        form.setFieldsValue(record)
                        setTriggerRefresh(!triggerRefresh)
                      }
                    }>
                      Edit
                    </Button>
                    <Popconfirm
                      title="sure to delete?"
                      onConfirm={
                        async function deleteCabang() {
                          const requstType = 'delete'
                          const result = await fetch('/api/master/transaksi/listrik', {
                            method: "POST",
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              requestType: requstType,
                              data: { id: record.id }
                            })
                          })
                          if (result.status == 200) {
                            setTriggerRefresh(!triggerRefresh)
                          }
                        }
                      }
                    >
                      <Button size="small" danger>
                        Delete
                      </Button>
                    </Popconfirm>
                  </Flex>
                ),
              }
            ]} dataSource={tagihanListrikData.filter((v: any) => v.id_aset == record.id_aset && v.id_cabang == record.id_cabang && v.id_pelanggan == record.id_pelanggan).map((item: any, index: number) => ({ ...item, key: index }))} pagination={false}/>
          }
        }}
      />
    </>

  )
}
