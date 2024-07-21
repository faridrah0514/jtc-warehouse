'use client'
import React, { useEffect, useState } from 'react'

import { Button, Flex, Form, Popconfirm, Spin, Table, Tag } from 'antd'
import AddSewaModal from './AddSewaModal'
import Title from 'antd/es/typography/Title'
import dayjs from 'dayjs';
import { _renderCurrency } from '@/app/utils/renderCurrency'

const column = [
  { title: "Nomor", dataIndex: 'no', key: 'no' },
  { title: "ID Transaksi", dataIndex: 'id_transaksi', key: 'id_transaksi' },
  { title: "Cabang", dataIndex: 'nama_cabang', key: 'nama_cabang' },
  { title: "Aset", dataIndex: 'nama_aset', key: 'nama_aset' },
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
]
export default function Page() {

  const [sewaData, setSewaData] = useState<any[]>([]);
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(true);
  const [isEdit, setIsEdit] = useState<boolean>(false)
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm()
  const [maxId, setMaxId] = useState<number>(0)

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
        console.log("data.data: ", data.data)
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
      </Flex>
      {(loading) ?
        <div className="flex justify-center items-center">
          <Spin size="large" />
        </div>
        :
        <>
          <AddSewaModal sewaData={sewaData} maxId={maxId} form={form} isEdit={isEdit} setOpenModal={setOpenModal} openModal={openModal} triggerRefresh={triggerRefresh} setTriggerRefresh={setTriggerRefresh} />
          <Table className='overflow-auto'
            scroll={{ x: 2000 }}
            // scroll={true}
            columns={[...column, {
              title: "Dokumen",
              key: "dokumen",
              width: 350,
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
            }]}
            dataSource={sewaData?.map((item: any, index: number) => ({ ...item, key: index }))}
            rowKey='id'
            size='small'
            loading={sewaData ? false : true}
            bordered
          />
        </>
      }
    </>
  )
}