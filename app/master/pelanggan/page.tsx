'use client'
import DefaultLayout from '@/app/components/defaultLayout/DefaultLayout'
import React, { useEffect, useState } from 'react'

import { openDB } from '@/helper/db'
import { Button, Modal, Table, TableProps } from 'antd'
import AddPelangganModal from './AddPelangganModal'
interface DataPelanggan {
  id: number,
  nama: string,
  alamat: string,
  kota: string,
  no_tlp: number,
  contact_person: string
}

const schemaList: string[] = ['id', 'nama', 'alamat', 'kota', 'no_tlp', 'contact_person']

const column: TableProps<DataPelanggan>['columns'] = schemaList.map(
  (value, i) => {
    return { title: value, dataIndex: value, key: value }
  }
)
export default function Page() {

  const [pelangganData, setPelangganData] = useState<DataPelanggan[]>();
  const [openModal, setOpenModal] = useState<boolean>(false)

  useEffect(
    () => {
      async function getData() {
        const response = await fetch('/api/master/pelanggan', { method: 'GET' })
        const data = await response.json()

        if (data) {
          setPelangganData(data.data)
          // console.log("data dari Effect: ", data.data)
        }
        // console.log("cabang data: ", pelangganData)
        // console.log("columns ==> ", column)
      }
      getData()
    }, []
  )
  return (
    <>
      <Button onClick={() => { setOpenModal(true); console.log("diklik niiiii"); console.log("modalState: ", openModal) }}>Tambah Pelanggan</Button>
      <AddPelangganModal setOpenModal={setOpenModal} openModal={openModal} />
      <Table className='overflow-auto'
        columns={column}
        dataSource={pelangganData}
        rowKey='id'
        size='small'
      />
    </>

  )
}
