'use client'
import React, { useEffect, useState } from 'react'

import { Button, ConfigProvider, Flex, Form, Popconfirm, Table, TableProps, Tag } from 'antd'
import { DataCabang } from '@/app/types/master'
import Title from 'antd/es/typography/Title'
import dayjs from 'dayjs';
import AddListrikModal from './AddListrikModal'
import Link from 'next/link'
import AddListrikModalV2 from './AddListrikModalV2'


const column = [
  // { title: "Nomor", dataIndex: 'no', key: 'no' },
  // { title: "ID Transaksi", dataIndex: 'id', key: 'id' },
  // { title: "Pelanggan", dataIndex: 'nama_pelanggan', key: 'nama_pelanggan' },
  // { title: "Cabang", dataIndex: 'nama_cabang', key: 'nama_cabang' },
  // { title: "Aset", dataIndex: 'nama_aset', key: 'nama_aset' },
  { title: "Bln/Thn", dataIndex: 'bln_thn', key: 'bln_thn' },
  { title: "Meteran Awal", dataIndex: 'meteran_awal', key: 'meteran_awal' },
  { title: "Meteran Akhir", dataIndex: 'meteran_akhir', key: 'meteran_akhir' },
]

const columnSewa = [
  { title: "Nomor", dataIndex: 'no', key: 'no' },
  // { title: "ID Transaksi", dataIndex: 'id_transaksi', key: 'id_transaksi' },
  { title: "Cabang", dataIndex: 'nama_cabang', key: 'nama_cabang' },
  { title: "Aset", dataIndex: 'nama_aset', key: 'nama_aset' },
  { title: "Pelanggan", dataIndex: 'nama_pelanggan', key: 'nama_pelanggan' },
  // { title: "Tanggal Akte", dataIndex: 'tanggal_akte_1', key: 'tanggal_akte' },
  // { title: "Nomor Akte", dataIndex: 'no_akte', key: 'no_akte' },
  // { title: "Notaris", dataIndex: 'notaris', key: 'notaris' },
  { title: "Tanggal Awal Sewa", dataIndex: 'start_date_sewa', key: 'start_date_sewa' },
  { title: "Tanggal Akhir Sewa", dataIndex: 'end_date_sewa', key: 'end_date_sewa' },
  // { title: "Periode Pembayaran", dataIndex: 'periode_pembayaran', key: 'periode_pembayaran' },
  // { title: "Harga", dataIndex: 'harga_rp', key: 'harga_rp' },
  // { title: "Total Biaya Sewa", dataIndex: 'total_biaya_sewa_rp', key: 'total_biaya_sewa_rp' },
  // { title: "Iuran IPL", dataIndex: 'ipl_rp', key: 'ipl_rp' },
]
export default function Page() {

  const [tagihanListrikData, setTagihanListrik] = useState<any[]>([]);
  const [dataSewa, setDataSewa] = useState<any[]>([])
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(true);
  const [isEdit, setIsEdit] = useState<boolean>(false)
  const [form] = Form.useForm()

  async function getData() {
    const response = await fetch('/api/master/transaksi/listrik', { method: 'GET', cache: 'no-store' })
    const sewa = await fetch('/api/master/transaksi/sewa', { method: 'GET', cache: 'no-store' })
    const dataSewa = await sewa.json()
    const data = await response.json()
    if (data) {
      data.data.map((v: any, i: number) => {
        v.no = i + 1
        // v.harga_rp = _renderCurrency(v.harga)
        // v.total_biaya_sewa_rp = _renderCurrency(v.total_biaya_sewa)
        return v
      })
      setTagihanListrik(data.data)
    }
    if (dataSewa) {
      dataSewa.data.map((v: any, i: number) => {
        v.no = i + 1
        return v
      })
      setDataSewa(dataSewa.data.filter((value: any) => value.is_pln == 1))
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
      {/* <Flex className='pb-5' gap={'small'} vertical={false}>
        <Button onClick={() => { setOpenModal(true) }}>+ Transaksi Tagihan Listrik</Button>
      </Flex> */}
      {/* <AddSewaModal maxId={maxId} form={form} isEdit={isEdit} setOpenModal={setOpenModal} openModal={openModal} triggerRefresh={triggerRefresh} setTriggerRefresh={setTriggerRefresh} /> */}
      {/* <AddListrikModal form={form} isEdit={isEdit} setOpenModal={setOpenModal} openModal={openModal} triggerRefresh={triggerRefresh} setTriggerRefresh={setTriggerRefresh} tagihanListrik={tagihanListrikData}> </AddListrikModal> */}
      <AddListrikModalV2 form={form} isEdit={isEdit} setOpenModal={setOpenModal} openModal={openModal} triggerRefresh={triggerRefresh} setTriggerRefresh={setTriggerRefresh} tagihanListrik={tagihanListrikData} />
      {/* <AddListrikModal modalProps={{ form, isEdit, openModal, setOpenModal, triggerRefresh, setTriggerRefresh }}></AddListrikModal> */}
      {/* <Table className='overflow-auto'
        dataSource={tagihanListrikData}
        scroll={{ x: true }}
        columns={[
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
                    // record.masa_sewa = [dayjs(record.start_date_sewa, 'DD-MM-YYYY'), dayjs(record.end_date_sewa, 'DD-MM-YYYY')]
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
            width: 75
          }
        ]}
        // dataSource={sewaData}
        rowKey='id'
        size='small'
        // loading={sewaData ? false : true}
        bordered
      /> */}
      <Table className='overflow-auto'
        columns={[
          ...columnSewa,
          {
            title: "Status Sewa",
            key: "status_sewa",
            render: (_, record: any) => {
              const today = dayjs() 
              if (dayjs(record.start_date_sewa, "DD-MM-YYYY") > today)
                return <Tag color='processing'>Akan Datang</Tag>
              else if (dayjs(record.start_date_sewa, "DD-MM-YYYY") <= today && today <= dayjs(record.end_date_sewa, "DD-MM-YYYY"))
                return <Tag color='success'>Aktif</Tag>
              else
                return <Tag color='default'>Non-Aktif</Tag>
            }
          },
          {
            title: "Action",
            key: "action",
            render: (_, record: any) => (
              <Flex gap="small">
                {/* <ConfigProvider
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
                </ConfigProvider> */}
                <Button type="primary" ghost size="small" onClick={
                  () => {
                    setOpenModal(true)
                    setIsEdit(false)
                    // record.bln_thn = dayjs(record.bln_thn, 'MM-YYYY')
                    // record.masa_sewa = [dayjs(record.start_date_sewa, 'DD-MM-YYYY'), dayjs(record.end_date_sewa, 'DD-MM-YYYY')]
                    form.setFieldsValue(record)
                    setTriggerRefresh(!triggerRefresh)
                  }
                }>
                  + Transaksi Tagihan Listrik
                </Button>
                {/* <Popconfirm
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
                </Popconfirm> */}
              </Flex>
            ),
            // width: 75
          }
        ]}
        dataSource={dataSewa}
        expandable={{
          // fixed:'left',
          expandedRowRender: (record) => {
            const columns = [
              {
                title: 'Jenis Dokumen', dataIndex: 'fileType', key: 'fileType',
              },
            ]
            return <Table columns={[
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
                // width: 75
              }
            ]} dataSource={tagihanListrikData.filter((v: any) => v.id_aset == record.id_aset && v.id_cabang == record.id_cabang && v.id_pelanggan == record.id_pelanggan)} pagination={false}/>
          }
        }}
      />
    </>

  )
}
