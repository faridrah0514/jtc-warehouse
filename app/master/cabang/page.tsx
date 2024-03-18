'use client'
import React, { useEffect, useState } from 'react'

import { Button, Flex, Form, Modal, Popconfirm, Table, TableProps } from 'antd'
import AddCabangModal from './AddCabangModal'
import { DataCabang } from '@/app/types/master'
import { useForm } from 'antd/es/form/Form'

const schemaList: string[] = ['id', 'nama_perusahaan', 'alamat', 'kota', 'no_tlp', 'status', 'kwh_rp']

const column: TableProps<DataCabang>['columns'] = schemaList.map(
  (value, i) => {
    return { title: value, dataIndex: value, key: value }
  }
)
export default function Page() {
  const [form] = Form.useForm()
  const [cabangData, setCabangData] = useState<DataCabang[]>();
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(true);
  const [isEdit, setIsEdit] = useState<boolean>(false)

  useEffect(
    () => {
      async function getData() {
        const response = await fetch('/api/master/cabang', { method: 'GET' })
        const data = await response.json()

        if (data) {
          setCabangData(data.data)
        }
      }
      getData()
    }, [triggerRefresh]
  )
  return (
    <>
      <Button onClick={() => { setOpenModal(true); setIsEdit(false) }}>Tambah Cabang</Button>
      <AddCabangModal isEdit={isEdit} form={form} setOpenModal={setOpenModal} openModal={openModal} triggerRefresh={triggerRefresh} setTriggerRefresh={setTriggerRefresh} />
      <Table className='overflow-auto'
        columns={[...column, {
          title: "Action",
          key: "action",
          render: (_, record) => (
            <Flex gap="small">
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
                      body: JSON.stringify({id: record.id})
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
        loading={ cabangData ? false : true }
        bordered
      />
    </>

  )
}
