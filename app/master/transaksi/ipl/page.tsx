'use client'
import React, { useEffect, useState } from 'react'

import { Button, Collapse, Flex, Form, Modal, Popconfirm, Select, Table, TableProps, Tag, Typography, } from 'antd'
const { Option } = Select;
const { Text } = Typography;
import Title from 'antd/es/typography/Title'
import dayjs from 'dayjs';
import { _renderCurrency } from '@/app/utils/renderCurrency'
import type { CollapseProps } from 'antd';
import AddIPLModal from './AddIPLModal';

export default function Page() {

  const [ubahModal, setUbahModal] = useState<boolean>(false)
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(true);
  const [isEdit, setIsEdit] = useState<boolean>(false)
  const [form] = Form.useForm()
  const [maxId, setMaxId] = useState<number>(0)
  const [items, setItems] = useState<{ key: number, label: string, children: any }[]>([])

  async function getData() {
    const response = await fetch('/api/master/transaksi/ipl', { method: 'GET', cache: 'no-store' })
    const data = await response.json()

    if (data) {
      let a: any[] = []
      Object.keys(data.dataobj).forEach((element, i) => {
        a.push({
          key: i, label: element, children:
            <>
              <Table pagination={false} key={i} columns={[
                { title: "Nama Aset", key: "nama_aset", dataIndex: "nama_aset" },
                { title: "Nama Pelanggan", key: "nama_pelanggan", dataIndex: "nama_pelanggan" },
                { title: "Nama Cabang", key: "nama_cabang", dataIndex: "nama_cabang" },
                {
                  title: "Status Pembayaran", key: "status_pembayaran", dataIndex: "status_pembayaran",
                  render: (value, record) => {
                    if (value != 'Lunas') {
                      return <Tag color='red'>{value}</Tag>
                    } else {
                      return <Tag color='green'>{value}</Tag>
                    }
                  }
                },
                { title: "Tagihan IPL", key: "ipl", dataIndex: "ipl", render: (value, record: any) => _renderCurrency(value) },
                {
                  title: "Action",
                  key: "action",
                  render: (_, record: any) => (
                      <Button type="primary" ghost size="small" onClick={
                        () => {
                          setUbahModal(true)
                          form.setFieldsValue(record)
                        }
                      }>
                        Ubah Status Pembayaran
                      </Button>
                  ),
                }
              ]}
                dataSource={data.dataobj[element].map((item: any, index: number) => ({ ...item, key: index }))}
              />
            </>
        })
      })
      setItems(a)
    }
  }

  useEffect(
    () => {
      getData()
    }, [triggerRefresh]
  )

  async function ubahStatusPembayaran(value: any) {
    console.log("value --> ", value)
    await fetch('/api/master/transaksi/ipl', {
      method: 'POST', body:
        JSON.stringify({
          requestType: 'ubahStatusPembayaran',
          data: value,
        })
      ,
      headers: {
        'Content-Type': 'application/json',
      },
    })
    setUbahModal(false)
    setTriggerRefresh(!triggerRefresh)
  }
  return (
    <>
      <Title level={3}>Halaman Data Master Transaksi - IPL</Title>
      <Flex className='pb-5' gap={'small'} vertical={false}>
        <Button onClick={() => { setOpenModal(true) }}>+ Buat Tagihan IPL</Button>
      </Flex>
      <Modal open={ubahModal} closeIcon={null} footer={null} title='Form Tambah Tipe Aset'>
        <Form name="addTipeAsetForm" onFinish={ubahStatusPembayaran} form={form}>
            <Form.Item name='id_pelanggan' label='Nama Pelanggan' hidden/>
            <Form.Item name='id_cabang' label='Nama Cabang' hidden/>
            <Form.Item name='id_aset' label='Nama Aset' hidden/>
            <Form.Item name='periode_pembayaran' label='Nama Aset' hidden/>
            <Text>Ubah status pembayaran pada Nama Pelanggan: <strong>{form.getFieldValue("nama_pelanggan")}</strong>, Nama Cabang: <strong>{form.getFieldValue("nama_cabang")}</strong>, dan Nama Aset: <strong>{form.getFieldValue("nama_aset")}</strong></Text>
            <Form.Item name='status_pembayaran' label="Status Pembayaran">
              <Select placeholder="Status Pembayaran" allowClear>
                <Option value='Belum Lunas'>Belum Lunas</Option>
                <Option value='Lunas'>Lunas</Option>
              </Select>
            </Form.Item>
          <div className="flex justify-end gap-2 pt-4">
            <Form.Item>
              <Button onClick={() => {
                setUbahModal(false)
              }}>Cancel</Button>
            </Form.Item>
            <Form.Item>
              <Button htmlType="submit" type="primary">Submit</Button>
            </Form.Item>
          </div>
        </Form>
      </Modal>
      <AddIPLModal maxId={maxId} form={form} isEdit={isEdit} setOpenModal={setOpenModal} openModal={openModal} triggerRefresh={triggerRefresh} setTriggerRefresh={setTriggerRefresh} />
      <Collapse items={items}></Collapse>
    </>
  )
}
