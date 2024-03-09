'use client'
import DefaultLayout from '@/app/components/defaultLayout/DefaultLayout'
import React, { useEffect, useState } from 'react'

import { openDB } from '@/helper/db'
import { Button, Modal, Table, TableProps } from 'antd'
import AddCabangModal from './AddCabangModal'
interface DataCabang {
  id: number,
  nama_perusahaan: string,
  alamat: string,
  kota: string,
  no_tlp: number,
  status: string,
  kwh_rp: number
}

const schemaList: string[] = ['id', 'nama_perusahaan', 'alamat', 'kota', 'no_tlp', 'status', 'kwh_rp']

const column: TableProps<DataCabang>['columns'] = schemaList.map(
  (value, i) => {
    return { title: value, dataIndex: value, key: value }
  }
)
export default function Page() {

  const [cabangData, setCabangData] = useState<DataCabang[]>();
  const [openModal, setOpenModal] = useState<boolean>(false)

  useEffect(
    () => {
      async function getData() {
        const response = await fetch('/api/master/cabang', { method: 'GET' })
        const data = await response.json()

        if (data) {
          setCabangData(data.data)
          // console.log("data dari Effect: ", data.data)
        }
        // console.log("cabang data: ", cabangData)
        // console.log("columns ==> ", column)
      }
      getData()
    }, []
  )
  return (
    <>
      <Button onClick={() => { setOpenModal(true); console.log("diklik niiiii"); console.log("modalState: ", openModal) }}>Tambah Cabang</Button>
      <AddCabangModal setOpenModal={setOpenModal} openModal={openModal} />
      <Table className='overflow-auto'
        columns={column}
        dataSource={cabangData}
        rowKey='id'
        size='small'
      />
    </>

  )
}
