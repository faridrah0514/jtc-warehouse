'use client'
import React, { useEffect, useState } from 'react'

import { Button, ConfigProvider, Dropdown, Flex, Form, Modal, Popconfirm, Select, Space, Table, TableProps, message } from 'antd'
import AddAssetModal from './AddAssetModal'
import { DataCabang, DataAset } from '@/app/types/master'
import Link from 'next/link'
import type { TableColumnsType } from 'antd';
import { DownOutlined, ExclamationCircleFilled } from '@ant-design/icons'
import Title from 'antd/es/typography/Title'
import path from "path";


interface ExpandedDataType {
  key: React.Key;
  file: string[];
  fileType: string[];
  url: string,
  id_aset: string
}
// import type { TableColumnsType } from 'antd';

const { confirm } = Modal;

const column = [
  { title: "Nomor", dataIndex: 'no', key: 'no', width: 75, },
  { title: "ID Aset", dataIndex: 'id_aset', key: 'id_aset', width: 150 },
  { title: "Tipe Aset", dataIndex: 'tipe_aset', key: 'tipe_aset', width: 100 },
  { title: "Nama Aset", dataIndex: 'nama_aset', key: 'nama_aset', width: 100 },
  { title: "Cabang", dataIndex: 'cabang', key: 'cabang', width: 150 },
  { title: "Alamat", dataIndex: 'alamat', key: 'alamat', width: 150 },
  { title: "Kota", dataIndex: 'kota', key: 'kota', width: 100 },
  { title: "No. tlp", dataIndex: 'no_tlp', key: 'no_tlp', width: 100 },
  // { title: "No. Rek. Air", dataIndex: 'no_rek_air', key: 'no_rek_air' },
  // { title: "No. Rek. Listrik", dataIndex: 'no_rek_listrik', key: 'no_rek_listrik' },
  // { title: "No. PBB", dataIndex: 'no_pbb', key: 'no_pbb' },
  // { title: "Tipe Sertifikat", dataIndex: 'tipe_sertifikat', key: 'tipe_sertifikat' },
  // { title: "No. Sertifikat", dataIndex: 'no_sertifikat', key: 'no_sertifikat' },
  // { title: "Tgl. Akhir HGB", dataIndex: 'tanggal_akhir_hgb', key: 'tanggal_akhir_hgb' },
]

const OPTIONS = column.map((v, i) => v.title).filter(v => ((v !== 'Nomor') && (v !== 'Nama Aset')))



export default function Page() {
  const [form] = Form.useForm<DataAset>()
  const [asetData, setAsetData] = useState<DataAset[]>();
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(true);
  const [isEdit, setIsEdit] = useState<boolean>(false)
  const [isAddDocument, setIsAddDocument] = useState<boolean>(false)
  const [maxId, setMaxId] = useState<number>(0)
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const filteredOptions = OPTIONS.filter((o) => !selectedItems.includes(o));
  const file_extension: string[] = ['.xlsx', '.xls', '.doc', '.docx']
  const items = [
    { key: '1', label: 'View' },
    { key: '2', label: 'Edit Data' },
    { key: '3', label: 'Tambah Dokumen' },
    { key: '4', label: 'Delete' }
  ]

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
      <AddAssetModal
        maxId={maxId}
        isAddDocument={isAddDocument}
        isEdit={isEdit}
        form={form}
        setOpenModal={setOpenModal}
        openModal={openModal}
        triggerRefresh={triggerRefresh}
        setTriggerRefresh={setTriggerRefresh}
        setIsEdit={setIsEdit}
        setIsAddDocument={setIsAddDocument}
      />
      <Flex className='pb-5' gap={'small'} vertical={false}>
        <Button onClick={() => { setOpenModal(true); setIsEdit(false) }}>Tambah Aset</Button>
      </Flex>

      <Table className='overflow-auto'
        // scroll={{ x: 1500 }}
        // scroll=true
        columns={[...column, {
          title: "Action",
          key: "action",
          width: 350,
          render: (_, record) => (
            <Dropdown.Button placement="bottomLeft" trigger={['click']} size="small" icon={<DownOutlined />} menu={{
              items: [
                {
                  key: 1,
                  label: (
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
                        View
                      </Link>
                    </ConfigProvider>
                  ),
                },
                {
                  key: 2,
                  label: (
                    <a
                      onClick={
                        () => {
                          setOpenModal(true)
                          setIsEdit(true)
                          setIsAddDocument(false)
                          form.setFieldsValue(record)
                        }
                      }>
                      Edit
                    </a>
                  )
                },
                {
                  key: 3, label: (
                    <a
                      onClick={
                        () => {
                          setOpenModal(true)
                          setIsEdit(false)
                          setIsAddDocument(true)
                          form.setFieldsValue(record)
                        }
                      }>
                      Tambah Dokumen
                    </a>
                  )
                },
                {
                  key: 4,
                  label: (
                    <a
                      onClick={
                        () => {
                          confirm({
                            title: 'Are you sure delete this asset?',
                            icon: <ExclamationCircleFilled />,
                            content: `Nama Aset: ${record.nama_aset}`,
                            okText: 'Yes',
                            okType: 'danger',
                            okButtonProps: {
                              disabled: false,
                            },
                            cancelText: 'No',
                            onOk() {
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
                                  message.success("Delete berhasil")
                                } else {
                                  message.error("Delete gagal")
                                }
                                setTriggerRefresh(!triggerRefresh)
                              }
                              deleteAset()
                            },
                            onCancel() {
                              console.log('Cancel');
                            },
                          });
                        }
                      }
                    >Delete</a>
                  )
                }
              ]
            }}>Actions</Dropdown.Button>
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
                    {record.file.filter(filename => !filename.startsWith('___pdf___')).map(
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
                  <>
                    <Flex gap='small'>
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
                        <Button size="small">Delete All</Button>
                      </Popconfirm>
                      {/* <Button size="small" onClick={() => {
                        console.log("value: ", value, "record: ", record)
                        // setOpenModal(true)
                      }}>
                        Edit Document
                      </Button> */}
                      <Dropdown.Button placement="bottomLeft" trigger={['click']} size="small" icon={<DownOutlined />} 
                      menu={{
                        items: record.file.map((v, idx) => {
                          if (!v.startsWith('___pdf___')) {
                            const extension: string = path.extname(v).toLowerCase();
                            if (file_extension.includes(extension)) {
                             return {key: idx, label: (<a href={`/upload/docs/${record.url}/___pdf___${v.replaceAll(extension, '.pdf')}`} target="_blank" rel="noopener noreferrer" onClick={() => {
                              const printWindow = window.open(`/upload/docs/${record.url}/___pdf___${v.replaceAll(extension, '.pdf')}`);
                              printWindow?.print();
                             }}>{v}</a>)}
                            }
                            return {key: idx, label: (<a href={`/upload/docs/${record.url}/${v}`} target="_blank" rel="noopener noreferrer" onClick={() => {
                              const printWindow = window.open(`/upload/docs/${record.url}/${v}`);
                              printWindow?.print();
                            }}>{v}</a>)}
                          } else {
                            return null
                          }
                        })
                      }}>Print</Dropdown.Button>
                    </Flex>
                  </>
                ),
              },
            ]

            // interface a extends DataAset {
            //   list_files: string[],
            //   list_dir: string[],
            //   list_dir_files: any[]
            // }
            // const newRec = record as a

            const newDataSource: ExpandedDataType[] = record.list_dir_files.map(
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
