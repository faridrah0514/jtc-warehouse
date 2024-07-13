'use client'
import React, { useEffect, useState } from 'react'

import { Button, Collapse, DatePicker, Flex, Form, Modal, Popconfirm, Select, Space, Table, TableProps, Tag, Typography, } from 'antd'
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
  const [form] = Form.useForm()
  const [items, setItems] = useState<{ key: number, label: string, children: any }[]>([])

  async function getData() {
    const response = await fetch('/api/master/transaksi/ipl', { method: 'GET', cache: 'no-store' })
    const data = await response.json()

    if (data) {
      let a: any[] = []
      Object.keys(data.dataobj).forEach((element, i) => {
        a.push({
          key: i,
          label: 
            <Flex gap={'small'} align='flex-start' justify='space-between'>
              <Text>{dayjs(element, 'YYYY-MM').format('MM-YYYY')}</Text>
              <Popconfirm title="sure to delete?"
              onConfirm={
                async function deleteAset() {
                  const result = await fetch('/api/master/transaksi/ipl', {
                    method: "POST",
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      // folder: record.url,
                      data: {periode_pembayaran: element},
                      requestType: "delete_period",
                    })
                  })
                  if (result.status == 200) {
                    setTriggerRefresh(!triggerRefresh)
                  }
                }
              }
              >
                <Button danger type='text' size="small">Delete</Button>
              </Popconfirm>
            </Flex>
          ,
          children:
            <>
              <Table pagination={false} key={i} size='small' bordered columns={[
                { title: "Nama Cabang", key: "nama_cabang", dataIndex: "nama_cabang" },
                { title: "Nama Aset", key: "nama_aset", dataIndex: "nama_aset" },
                { title: "Nama Pelanggan", key: "nama_pelanggan", dataIndex: "nama_pelanggan" },
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
                { title: "Tanggal Pembayaran", key: "tanggal_pembayaran", dataIndex: "tanggal_pembayaran" },
                {
                  title: "Action",
                  key: "action",
                  render: (_, record: any) => (
                    <Button type="primary" ghost size="small" onClick={
                      () => {
                        setUbahModal(true)
                        if (record.tanggal_pembayaran) {
                          record.tanggal_pembayaran = dayjs(record.tanggal_pembayaran, 'DD-MM-YYYY')
                        }

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
    value.tanggal_pembayaran = value.tanggal_pembayaran.format("DD-MM-YYYY")
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
        <Form name="addTipeAsetForm" onFinish={ubahStatusPembayaran} form={form} layout='horizontal'
          labelAlign='left'
          labelCol={{ span: 8 }}
        // labelWrap
        // wrapperCol={{ span: 15 }}
        >
          <Form.Item name='id_pelanggan' label='Nama Pelanggan' hidden />
          <Form.Item name='id_cabang' label='Nama Cabang' hidden />
          <Form.Item name='id_aset' label='Nama Aset' hidden />
          <Form.Item name='periode_pembayaran' label='Nama Aset' hidden />
          <div className='pb-5'>
            <Text>Ubah status pembayaran pada Nama Cabang: <strong>{form.getFieldValue("nama_cabang")}</strong>, Nama Aset: <strong>{form.getFieldValue("nama_aset")}</strong> dan Nama Pelanggan: <strong>{form.getFieldValue("nama_pelanggan")}</strong></Text>
          </div>
          <Form.Item className={'pt-10'} name='status_pembayaran' label="Status Pembayaran">
            <Select placeholder="Status Pembayaran" allowClear>
              <Option value='Belum Lunas'>Belum Lunas</Option>
              <Option value='Lunas'>Lunas</Option>
            </Select>
          </Form.Item>
          <Form.Item name='tanggal_pembayaran' label="Tanggal Pembayaran">
            <DatePicker
              allowClear={false}
              format={'DD-MM-YYYY'}
            />
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
      <AddIPLModal form={form} setOpenModal={setOpenModal} openModal={openModal} triggerRefresh={triggerRefresh} setTriggerRefresh={setTriggerRefresh} />
      <Collapse items={items}></Collapse>
    </>
  )
}
