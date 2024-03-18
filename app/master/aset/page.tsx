'use client'
import React, { useEffect, useState } from 'react'

import { Button, Flex, Modal, Popconfirm, Table, TableProps } from 'antd'
import AddAssetModal from './AddAssetModal'
import { DataCabang } from '@/app/types/master'

const schemaList: string[] = ['id', 'id_aset', 'tipe_aset', 'nama_aset', 'cabang', 'alamat', 'kota', 'status']

const column: TableProps<DataCabang>['columns'] = schemaList.map(
  (value, i) => {
    return { title: value, dataIndex: value, key: value }
  }
)
export default function Page() {

  const [cabangData, setCabangData] = useState<DataCabang[]>();
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(true);

  useEffect(
    () => {
      async function getData() {
        const response = await fetch('/api/master/aset', { method: 'GET' })
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
      <Button onClick={() => { setOpenModal(true) }}>Tambah Aset</Button>
      <AddAssetModal setOpenModal={setOpenModal} openModal={openModal} triggerRefresh={triggerRefresh} setTriggerRefresh={setTriggerRefresh}/>
      <Table className='overflow-auto'
        columns={[...column, {
          title: "Action",
          key: "action",
          render: (_, record) => (
            <Flex gap="small">
              <Button type="primary" ghost size="small">
                Edit
              </Button>
              <Popconfirm
                title="sure to delete?"
                onConfirm={
                  async function deleteCabang() {
                    const result = await fetch('/api/master/aset/delete', {
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
        dataSource={cabangData}
        rowKey='id'
        size='small'
        loading={ cabangData ? false : true }
        bordered
      />
    </>

  )
}
