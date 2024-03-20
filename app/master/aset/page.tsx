'use client'
import React, { useEffect, useState } from 'react'

import { Button, Dropdown, Flex, Modal, Popconfirm, Space, Table, TableProps } from 'antd'
import AddAssetModal from './AddAssetModal'
import { DataCabang, DataAset } from '@/app/types/master'
import Link from 'next/link'
import type { TableColumnsType } from 'antd';
import { DownOutlined } from '@ant-design/icons'

interface ExpandedDataType {
  key: React.Key;
  file: string;
}


const schemaList: string[] = ['id_aset', 'tipe_aset', 'nama_aset', 'cabang', 'alamat', 'kota', 'status']

const column = schemaList.map(
  (value, i) => {
    return { title: value, dataIndex: value, key: value }
  }
)

export default function Page() {

  const [asetData, setAsetData] = useState<DataAset[]>();
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(true);
  // console.log("column ---> ", column)
  useEffect(
    () => {
      async function getData() {
        const response = await fetch('/api/master/aset', { method: 'GET' })
        const data = await response.json()
        if (data) {
          setAsetData(data.data)
        }
      }
      getData()
    }, [triggerRefresh]
  )
  return (
    
    <>
      <Button onClick={() => { setOpenModal(true) }}>Tambah Aset</Button>
      <AddAssetModal setOpenModal={setOpenModal} openModal={openModal} triggerRefresh={triggerRefresh} setTriggerRefresh={setTriggerRefresh} />
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
                      body: JSON.stringify({
                        id: record.id,
                        id_aset: record.id_aset,
                        nama_aset: record.nama_aset
                      })
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
        expandable={{
          // expandedRowRender: (record) =>
          //   {record.list_files.map((value) => (
          //     <p>{value}</p>
          //   ))}
          // ,
          expandedRowRender: (record) => {
            const columns: TableColumnsType<ExpandedDataType> = [
              {
                title: 'File', dataIndex: 'file', key: 'file',
                render(value, record, index) {
                  const newRecord = record as {key: number, url: string, file: string}
                  // console.log("value", value)
                  // console.log("Record: ", record)
                  // console.log("index", index)
                  return <a href={`/docs/${newRecord.url}/${value}`} target="_blank" rel="noopener noreferrer">{value}</a>
                },
              },
              {
                title: 'Action',
                dataIndex: 'operation',
                key: 'operation',
                render: () => (
                  <Space size="middle">
                    <a>Delete</a>
                  </Space>
                ),
              },
            ]

            interface a extends DataAset {
              list_files: string[]
            }
            const newRec = record as a

            const dataSource = newRec.list_files.map(
              (value, key) => { return { key: key, file: value, url: record.id_aset.replaceAll(" ", "_") + "_" + record.nama_aset.replaceAll(" ", "_") } }
            )
            // console.log("record ---> ", dataSource)
            return <Table columns={columns} dataSource={dataSource} pagination={false} />
            // return <>
            //   {record.list_files.map((values, key) => <div><a key={key} href={`/docs/${record.id_aset.replaceAll(" ", "_")}_${record.nama_aset.replaceAll(" ", "_")}/${values}`} target="_blank" rel="noopener noreferrer">
            //     {values}
            //   </a></div>)}
            // </>
          }

          // rowExpandable: (record) => record.nama_aset !== 'Not expandable',
        }}
        dataSource={asetData}
        rowKey='id'
        size='small'
        loading={asetData ? false : true}
        bordered
      />
    </>

  )
}
