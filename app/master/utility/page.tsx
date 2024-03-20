'use client'
import React, { useEffect, useState } from 'react'

import { Button, Modal, Table, TableProps } from 'antd'
import AddUtilityModal from './AddUtilityModal'
import { DataUtility } from '@/app/types/master'

const schemaList: string[] = ['id', 'IPL', 'awal', 'akhir', 'terpakai', 'asset']

const column: TableProps<DataUtility>['columns'] = schemaList.map(
  (value, i) => {
    return { title: value, dataIndex: value, key: value }
  }
)
export default function Page() {

  const [utilityData, setUtilityData] = useState<DataUtility[]>();
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(true);

  useEffect(
    () => {
      async function getData() {
        const response = await fetch('/api/master/utility', { method: 'GET' })
        const data: DataUtility[] = (await response.json()).data
        if (data) {
          data.map(
            (value) => {
              value.terpakai = value.awal - value.akhir
            }
          )
          setUtilityData(data)
        }
      }
      getData()
    }, [triggerRefresh]
  )
  return (
    <div>
      Page
    </div>
    // <>
    //   <Button onClick={() => { setOpenModal(true) }}>Tambah Utility</Button>
    //   <AddUtilityModal setOpenModal={setOpenModal} openModal={openModal} triggerRefresh={triggerRefresh} setTriggerRefresh={setTriggerRefresh} />
    //       <Table className='overflow-auto'
    //         columns={column}
    //         dataSource={utilityData} 
    //         rowKey='id'
    //         size='small'
    //         loading={ utilityData ? false : true}
    //         bordered
    //         />
      
    // </>

  )
}
