'use client'
import React, { useEffect, useState } from 'react'

import { Button, Flex, Form, Modal, Popconfirm, Table, TableProps } from 'antd'
import AddPelangganModal from './AddPelangganModal'
import { DataPelanggan } from '@/app/types/master'

const schemaList: string[] = ['id', 'nama', 'alamat', 'kota', 'no_tlp', 'contact_person']

const column = schemaList.map(
  (value, i) => {
    return { title: value, dataIndex: value, key: value }
  }
)
export default function Page() {
  const [form] = Form.useForm()
  const [pelangganData, setPelangganData] = useState<DataPelanggan[]>();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(true);
  const [isEdit, setIsEdit] = useState<boolean>(false)

  useEffect(
    () => {
      async function getData() {
        const response = await fetch('/api/master/pelanggan', { method: 'GET', cache: 'no-store' })
        const data = await response.json()

        if (data) {
          setPelangganData(data.data)
        }
      }
      getData()
    }, [triggerRefresh]
  )
  return (
    <>
      <Button onClick={() => { setOpenModal(true) }}>Tambah Pelanggan</Button>
      <AddPelangganModal form={form} isEdit={isEdit} setOpenModal={setOpenModal} openModal={openModal} triggerRefresh={triggerRefresh} setTriggerRefresh={setTriggerRefresh} />
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
                    const result = await fetch('/api/master/pelanggan/delete', {
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
        }]}
        dataSource={pelangganData}
        rowKey='id'
        size='small'
        loading={pelangganData ? false : true}
        bordered
      />
    </>

  )
}
