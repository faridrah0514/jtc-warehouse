'use client'
import React, { useEffect, useState } from 'react'

import { Button, ConfigProvider, Flex, Form, Modal, Popconfirm, Space, Table, TableProps } from 'antd'
import AddCabangModal from './AddCabangModal'
import { DataCabang } from '@/app/types/master'
import { useForm } from 'antd/es/form/Form'
import Title from 'antd/es/typography/Title'

// const schemaList: string[] = ['no', 'nama_perusahaan', 'alamat', 'kota', 'no_tlp', 'status', 'kwh_rp']

// const column = schemaList.map(
//   (value, i) => {
//     return { title: "AHHHHH", dataIndex: value, key: value }
//   }
// )
const column = [
  { title: "Nomor", dataIndex: 'no', key: 'no' },
  { title: "Nama Perusahaan", dataIndex: 'nama_perusahaan', key: 'nama_perusahaan' },
  { title: "Alamat", dataIndex: 'alamat', key: 'alamat' },
  { title: "Kota", dataIndex: 'kota', key: 'kota' },
  { title: "No Tlp", dataIndex: 'no_tlp', key: 'no_tlp' },
  { title: "Status", dataIndex: 'status', key: 'status' },
  { title: "Kwh Rp", dataIndex: 'kwh_rp', key: 'kwh_rp' },
]
export default function Page() {
  const [form] = Form.useForm()
  const [cabangData, setCabangData] = useState<DataCabang[]>();
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(true);
  const [isEdit, setIsEdit] = useState<boolean>(false)

  useEffect(
    () => {
      async function getData() {
        const response = await fetch('/api/master/cabang', { method: 'GET', cache: 'no-store' })
        const data = await response.json()

        if (data) {
          data.data.map(
            (value: DataCabang, index: number) => value.no = index + 1
          )
          setCabangData(
            data.data
          )
        }
      }
      getData()
    }, [triggerRefresh]
  )
  return (
    <>
    <Title level={3}>Halaman Data Master Cabang</Title>
    {/* <Space></Space> */}
      <Button className="mb-5" onClick={() => { setOpenModal(true); setIsEdit(false) }}>Tambah Cabang</Button>
      <AddCabangModal isEdit={isEdit} form={form} setOpenModal={setOpenModal} openModal={openModal} triggerRefresh={triggerRefresh} setTriggerRefresh={setTriggerRefresh} />
      <Table className='overflow-auto'
        columns={[...column, {
          title: "Action",
          key: "action",
          render: (_, record) => (
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
                {/* <Button type='primary' ghost size='small'>
                  View
                </Button> */}
              </ConfigProvider>
              <Button type="primary" ghost size="small" onClick={
                () => {
                  setOpenModal(true)
                  setIsEdit(true)
                  form.setFieldsValue(record)
                }
              }>
                Edit
              </Button>
              <Popconfirm
                title="sure to delete?"
                onConfirm={
                  async function deleteCabang() {
                    const result = await fetch('/api/master/cabang/delete', {
                      method: "POST",
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ id: record.id })
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
        },]}
        dataSource={cabangData}
        rowKey='id'
        size='small'
        loading={cabangData ? false : true}
        bordered
      />
    </>

  )
}
