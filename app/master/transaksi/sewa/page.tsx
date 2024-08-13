'use client'
import React, { useEffect, useRef, useState } from 'react'

import { Button, Divider, Flex, Form, Popconfirm, Spin, Table, Tag } from 'antd'
import AddSewaModal from './AddSewaModal'
import Title from 'antd/es/typography/Title'
import dayjs from 'dayjs';
import { _renderCurrency } from '@/app/utils/renderCurrency'
import { useReactToPrint } from 'react-to-print'
import type { TableColumnsType } from 'antd';


export default function Page() {

  const [sewaData, setSewaData] = useState<any[]>([]);
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(true);
  const [isEdit, setIsEdit] = useState<boolean>(false)
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm()
  const [maxId, setMaxId] = useState<number>(0)

  const column: TableColumnsType<any> = [
    { title: "Nomor", dataIndex: 'no', key: 'no' },
    { title: "ID Transaksi", dataIndex: 'id_transaksi', key: 'id_transaksi' },
    {
      title: "Cabang", dataIndex: 'nama_cabang', key: 'nama_cabang',
      filters: Array.from(new Set(sewaData?.map((x: any, y: number) => x.nama_cabang))).map((val: any, idx: number) => { return { text: val, value: val } }),
      onFilter: (val, record) => record.nama_cabang.indexOf(val as string) === 0
    },
    {
      title: "Aset", dataIndex: 'nama_aset', key: 'nama_aset',
      filters: Array.from(new Set(sewaData?.map((x: any, y: number) => x.nama_aset))).map((val: any, idx: number) => { return { text: val, value: val } }),
      onFilter: (val, record) => record.nama_aset.indexOf(val as string) === 0
    },
    { title: "Pelanggan", dataIndex: 'nama_pelanggan', key: 'nama_pelanggan' },
    { title: "Tanggal Akte", dataIndex: 'tanggal_akte_1', key: 'tanggal_akte' },
    { title: "Nomor Akte", dataIndex: 'no_akte', key: 'no_akte' },
    { title: "Notaris", dataIndex: 'notaris', key: 'notaris' },
    { title: "Tanggal Awal Sewa", dataIndex: 'start_date_sewa', key: 'start_date_sewa' },
    { title: "Tanggal Akhir Sewa", dataIndex: 'end_date_sewa', key: 'end_date_sewa' },
    { title: "Periode Pembayaran", dataIndex: 'periode_pembayaran', key: 'periode_pembayaran' },
    { title: "Harga", dataIndex: 'harga_rp', key: 'harga_rp' },
    { title: "Total Biaya Sewa", dataIndex: 'total_biaya_sewa_rp', key: 'total_biaya_sewa_rp' },
    { title: "Iuran IPL", dataIndex: 'ipl_rp', key: 'ipl_rp' },
    {
      title: "Dokumen",
      key: "dokumen",
      ellipsis: true,
      // width: 350,
      render: (_, record) => (
        <ul>
          {record.list_files.map((v: string, idx: number) => {
            return (
              <li key={idx}>
                <a href={`/upload/txs/${record.id_transaksi}/${v}`} target="_blank" rel="noopener noreferrer">{v}</a>
              </li>
            )
          })}
        </ul>
      )
    },
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
      },
      filters: [{ text: 'Akan Datang', value: 'Akan Datang' }, { text: 'Aktif', value: 'Aktif' }, { text: 'Non-Aktif', value: 'Non-Aktif' }],
      onFilter: (val, record) => {
        const today = dayjs()
        let status = ''
        if (dayjs(record.start_date_sewa, "DD-MM-YYYY") > today)
          status = 'Akan Datang'
        else if (dayjs(record.start_date_sewa, "DD-MM-YYYY") <= today && today <= dayjs(record.end_date_sewa, "DD-MM-YYYY"))
          status = 'Aktif'
        else
          status = 'Non-Aktif'
        return val === status
      }
    },
    {
      title: "Action",
      key: "action",
      render: (_, record: any) => (
        <Flex gap="small">
          <Button type="primary" ghost size="small" onClick={
            () => {
              setOpenModal(true)
              setIsEdit(true)
              record.tanggal_akte = dayjs(record.tanggal_akte_1, 'DD-MM-YYYY')
              record.masa_sewa = [dayjs(record.start_date_sewa, 'DD-MM-YYYY'), dayjs(record.end_date_sewa, 'DD-MM-YYYY')]
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
                await fetch('/api/master/transaksi/sewa', {
                  method: "POST",
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    requestType: requstType,
                    data: { id: record.id, id_transaksi: record.id_transaksi }
                  })
                }).then((res) => res.json())
                  .then((res) => {
                    if (res.status == 200) {
                      setTriggerRefresh(!triggerRefresh)
                    }
                  })
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
  ]

  const [print, setPrint] = useState<boolean>(false)
  const componentRef = useRef(null)
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onBeforeGetContent: () => {
      return new Promise<void>((resolve) => {
        setPrint(true)
        resolve()
      })
    },
    onBeforePrint: () => {

    },
    onAfterPrint: () => {
      setPrint(false)
    }

  })

  async function getData() {
    try {
      const response = await fetch('/api/master/transaksi/sewa', { method: 'GET', cache: 'no-store' })
      const data = await response.json()
      if (data) {
        data.data.map((v: any, i: number) => {
          v.no = i + 1
          v.harga_rp = _renderCurrency(v.harga)
          v.total_biaya_sewa_rp = _renderCurrency(v.total_biaya_sewa)
          v.ipl_rp = _renderCurrency(v.ipl)
          return v
        })
        setSewaData(data.data)
        setMaxId(data.maxId[0].max_id)
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false)
    }
  }

  useEffect(
    () => {
      getData()
    }, [triggerRefresh]
  )

  return (
    <>
      <Title level={3}>Halaman Data Master Transaksi - Sewa</Title>
      <Flex className='pb-5' gap={'small'} vertical={false}>
        <Button onClick={() => { setOpenModal(true) }}>+ Transaksi Sewa</Button>
        {/* <Button onClick={handlePrint}>Print Laporan</Button> */}
      </Flex>
      {(loading) ?
        <div className="flex justify-center items-center">
          <Spin size="large" />
        </div>
        :
        <>
          <AddSewaModal sewaData={sewaData} maxId={maxId} form={form} isEdit={isEdit} setOpenModal={setOpenModal} openModal={openModal} triggerRefresh={triggerRefresh} setTriggerRefresh={setTriggerRefresh} />
          <div ref={componentRef} className='print-container'>
            <div className='print-only mb-10'>
              <Title level={3} style={{ margin: 0 }}>DATA ASET MILIK PT.JTC WAREHOUSE</Title>
              <Title level={3} style={{ margin: 0 }}>Kantor pusat: xxxxxx, email: xxxx</Title>
              <Title level={4} style={{ margin: 0 }}>No. tlp: 0812xxxxx</Title>
              <Divider></Divider>
            </div>
            <div className='print-table-container'>
              <Table className='overflow-auto'
                scroll={{ x: 2000 }}
                // scroll={true}
                columns={print ? column.filter(col => col.key != 'dokumen' && col.key != 'action'  && col.key != 'no_akte' && col.key != 'notaris' && col.key != 'tanggal_akte') : column}
                dataSource={sewaData?.map((item: any, index: number) => ({ ...item, key: index }))}
                rowKey='id'
                size='small'
                loading={sewaData ? false : true}
                bordered
              />
            </div>
          </div>
          <style jsx global>{`
            .print-only {
              display: none;
            }
              .ant-table {
                width: 100% !important;
              }

              .ant-table-wrapper {
                width: 100%;
              }
            .no-print {
              display: block;
            }

            .print-table-container {
              display: block;
              width: 100%;
              overflow-x: auto;
            }

            @media print {
              @page {
                size: landscape;
                margin: 5mm;
              }

              .print-only {
                text-align: center;
                display: block;
              }

              .no-print {
                display: none;
              }
                
              .ant-table {
                width: 100% !important;
              }

              .ant-table-wrapper {
                width: 100% !important;
              }

              .print-table-container {
                display: block;
                margin: 0 auto;
                width: 100% !important;
                max-width: 100%;
              }

              .ant-table-pagination {
                display: none !important;
              }
            }
          `}</style>
        </>
      }
    </>
  )
}