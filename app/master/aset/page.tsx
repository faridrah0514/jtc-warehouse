'use client'
import React, { useEffect, useState } from 'react'

import { Button, ConfigProvider, Dropdown, Flex, Modal, Popconfirm, Space, Table, TableProps } from 'antd'
import AddAssetModal from './AddAssetModal'
import { DataCabang, DataAset } from '@/app/types/master'
import Link from 'next/link'
import type { TableColumnsType } from 'antd';
import { DownOutlined } from '@ant-design/icons'
import Title from 'antd/es/typography/Title'

interface ExpandedDataType {
  key: React.Key;
  file: string[];
  fileType: string[];
  url: string,
}

const column = [
  { title: "Nomor", dataIndex: 'no', key: 'no' },
  { title: "ID Aset", dataIndex: 'id_aset', key: 'id_aset' },
  { title: "Tipe Aset", dataIndex: 'tipe_aset', key: 'tipe_aset' },
  { title: "Nama Aset", dataIndex: 'nama_aset', key: 'nama_aset' },
  { title: "Cabang", dataIndex: 'cabang', key: 'cabang' },
  { title: "Alamat", dataIndex: 'alamat', key: 'alamat' },
  { title: "Kota", dataIndex: 'kota', key: 'kota' },
  { title: "Status", dataIndex: 'status', key: 'status' },
]

export default function Page() {

  const [asetData, setAsetData] = useState<DataAset[]>();
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(true);
  useEffect(
    () => {
      async function getData() {
        const response = await fetch('/api/master/aset', { method: 'GET', cache: 'no-store' })
        const data = await response.json()
        if (data) {
          data.data.map(
            (value: DataAset, index: number) => value.no = index + 1
          )
          setAsetData(data.data)
        }
      }
      getData()
    }, [triggerRefresh]
  )
  return (

    <>
      <Title level={3}>Halaman Data Master Aset</Title>
      <Button className="mb-5" onClick={() => { setOpenModal(true) }}>Tambah Aset</Button>
      <AddAssetModal setOpenModal={setOpenModal} openModal={openModal} triggerRefresh={triggerRefresh} setTriggerRefresh={setTriggerRefresh} />
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
                <Button type='primary' ghost size='small'>
                  View
                </Button>
              </ConfigProvider>
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
          expandedRowRender: (record) => {
            console.log("record ---> ", record)
            const columns = [
              {
                title: 'Jenis Dokumen', dataIndex: 'fileType', key: 'fileType',
              },
              {
                title: 'File', dataIndex: 'file', key: 'file',
                render(value: string[], record: ExpandedDataType) {
                  return <ul>
                    {record.file.map(
                      (value, idx) => {
                        return (
                          <li key={idx}>
                            <a href={`/docs/${record.url}/${value}`} target="_blank" rel="noopener noreferrer">{value}</a>
                          </li>
                        )
                      }
                    )}
                  </ul>
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
              list_files: string[],
              list_dir: string[],
              list_dir_files: any[]
            }
            const newRec = record as a

            const newDataSource: ExpandedDataType[] = newRec.list_dir_files.map(
              (value, idx) => {
                return {
                  fileType: Object.keys(value), key: idx, file: Object.values(value).flat() as string[], url: record.id_aset.replaceAll(" ", "_") + "_" + record.nama_aset.replaceAll(" ", "_") + "/" + Object.keys(value)
                }
              }
            )
            return <Table columns={columns} dataSource={newDataSource} pagination={false} />
          }
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
