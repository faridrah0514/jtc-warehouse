'use client'
import React, { useEffect, useState } from 'react'

import { Button, ConfigProvider, Dropdown, Flex, Form, Modal, Popconfirm, Select, Space, Table, TableProps } from 'antd'
import AddAssetModal from './AddAssetModal'
import { DataCabang, DataAset } from '@/app/types/master'
import Link from 'next/link'
import type { TableColumnsType } from 'antd';
import { DownOutlined } from '@ant-design/icons'
import Title from 'antd/es/typography/Title'
import { ExpandAction } from 'antd/es/tree/DirectoryTree'

interface ExpandedDataType {
  key: React.Key;
  file: string[];
  fileType: string[];
  url: string,
  id_aset: string
}

const column = [
  { title: "Nomor", dataIndex: 'no', key: 'no' },
  { title: "ID Aset", dataIndex: 'id_aset', key: 'id_aset' },
  { title: "Tipe Aset", dataIndex: 'tipe_aset', key: 'tipe_aset' },
  { title: "Nama Aset", dataIndex: 'nama_aset', key: 'nama_aset' },
  { title: "Cabang", dataIndex: 'cabang', key: 'cabang' },
  { title: "Alamat", dataIndex: 'alamat', key: 'alamat' },
  { title: "Kota", dataIndex: 'kota', key: 'kota' },
  { title: "No. tlp", dataIndex: 'no_tlp', key: 'no_tlp' },
  { title: "No. Rek. Air", dataIndex: 'no_rek_air', key: 'no_rek_air' },
  { title: "No. Rek. Listrik", dataIndex: 'no_rek_listrik', key: 'no_rek_listrik' },
  { title: "No. PBB", dataIndex: 'no_pbb', key: 'no_pbb' },
  { title: "Tipe Sertifikat", dataIndex: 'tipe_sertifikat', key: 'tipe_sertifikat' },
  { title: "No. Sertifikat", dataIndex: 'no_sertifikat', key: 'no_sertifikat' },
  { title: "Tgl. Akhir HGB", dataIndex: 'tanggal_akhir_hgb', key: 'tanggal_akhir_hgb' },
]

const OPTIONS = column.map((v, i) => v.title).filter(v => ((v !== 'Nomor') && (v !== 'Nama Aset')))

export default function Page() {
  const [form] = Form.useForm()
  const [asetData, setAsetData] = useState<DataAset[]>();
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(true);
  const [isEdit, setIsEdit] = useState<boolean>(false)
  const [maxId, setMaxId] = useState<number>(0)
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const filteredOptions = OPTIONS.filter((o) => !selectedItems.includes(o));
  // const newColumns = (column as .map((item) => ({
  //   ...item,
  //   hidden: !checkedList.includes(item.key as string),
  // }));
  useEffect(
    () => {
      async function getData() {
        const response = await fetch('/api/master/aset', { method: 'GET', cache: 'no-store' })
        const data = await response.json()
        if (data) {
          data.data.map(
            (value: DataAset, index: number) => value.no = index + 1
          )
          setMaxId(data.maxId[0].max_id)
          setAsetData(data.data)
        }
      }
      getData()
    }, [triggerRefresh]
  )
  return (

    <>
      <Title level={3}>Halaman Data Master Aset</Title>
      <AddAssetModal maxId={maxId} isEdit={isEdit} form={form} setOpenModal={setOpenModal} openModal={openModal} triggerRefresh={triggerRefresh} setTriggerRefresh={setTriggerRefresh} />
      <Flex className='pb-5' gap={'small'} vertical={false}>
        <Button onClick={() => { setOpenModal(true); setIsEdit(false) }}>Tambah Aset</Button>

        {/* <Select
          mode="multiple"
          placeholder="Filter Column"
          value={selectedItems}
          onChange={setSelectedItems}
          // style={{ width: '100%' }}
          className='min-w-40'
          options={filteredOptions.map((item) => ({
            value: item,
            label: item,
          }))}
        /> */}
      </Flex>

      <Table className='overflow-auto'
        scroll={{ x: 3000 }}
        // scroll=true
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
                <Link href={`/master/aset/view/${record.id_aset}`}>
                  <Button type='primary' ghost size='small'
                    onClick={() => { console.log("view click --> ", record) }}
                  >
                    View
                  </Button></Link>

              </ConfigProvider>
              <Button type="primary" ghost size="small"
                onClick={
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
                  async function deleteAset() {
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
          fixed: 'left',
          expandedRowRender: (record) => {
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
                            <a href={`/upload/docs/${record.url}/${value}`} target="_blank" rel="noopener noreferrer">{value}</a>
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
                render: (value: any, record: ExpandedDataType, index: number) => (
                  // <Space size="middle">
                  <Popconfirm title="sure to delete this file(s) ?"
                    onConfirm={
                      async function deleteAset() {
                        const result = await fetch('/api/master/aset/delete', {
                          method: "POST",
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            folder: record.url,
                            requestType: "delete_folder_doc",
                          })
                        })
                        if (result.status == 200) {
                          setTriggerRefresh(!triggerRefresh)
                        }
                      }

                    }>
                    <a>Delete</a>
                  </Popconfirm>

                  // </Space>
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
                  fileType: Object.keys(value),
                  key: idx,
                  file: Object.values(value).flat() as string[],
                  url: record.id_aset.replaceAll(" ", "_") + "/" + Object.keys(value),
                  id_aset: record.id_aset
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
