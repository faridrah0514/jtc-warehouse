'use client'
import DefaultLayout from '@/app/components/defaultLayout/DefaultLayout'
import React, { useEffect, useState } from 'react'

import { openDB } from '@/helper/db'
import { Button, Modal, Table, TableProps } from 'antd'
import AddUtilityModal from './AddUtilityModal'
interface DataUtility {
  id: number,
  IPL: string,
  awal: number,
  akhir: number,
  terpakai: number | 0,
  asset: string
}

const schemaList: string[] = ['id', 'IPL', 'awal', 'akhir', 'terpakai', 'asset']

const column: TableProps<DataUtility>['columns'] = schemaList.map(
  (value, i) => {
    return { title: value, dataIndex: value, key: value }
  }
)
export default function Page() {

  const [utilityData, setUtilityData] = useState<DataUtility[]>();
  const [openModal, setOpenModal] = useState<boolean>(false)

  useEffect(
    () => {
      async function getData() {
        const response = await fetch('/api/master/utility', { method: 'GET' })
        const data: DataUtility[] = (await response.json()).data
        console.log("data: ", data)
        if (data) {
          data.map(
            (value) => {
              value.terpakai = value.awal - value.akhir
            }
          )
          setUtilityData(data)
          console.log("data dari Effect: ", data)
        }
        // console.log("cabang data: ", utilityData)
        // console.log("columns ==> ", column)
      }
      getData()
    }, []
  )
  return (
    <>
      <Button onClick={() => { setOpenModal(true); console.log("diklik niiiii"); console.log("modalState: ", openModal) }}>Tambah Utility</Button>
      <AddUtilityModal setOpenModal={setOpenModal} openModal={openModal} />
      {
        !utilityData ?
          (<p>Loading</p>) :
          (<Table className='overflow-auto'
            columns={column}
            dataSource={utilityData} 
            rowKey='id'
            size='small'
            />)
      }
    </>

  )
}
