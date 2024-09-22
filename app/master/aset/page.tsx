'use client'
import React, { useEffect, useRef, useState } from 'react'

import { Button, ConfigProvider, Divider, Dropdown, Flex, Form, Input, Modal, Popconfirm, Select, Space, Table, TableProps, message } from 'antd'
import AddAssetModal from './AddAssetModal'
import { DataCabang, DataAset } from '@/app/types/master'
import Link from 'next/link'
import type { TableColumnsType } from 'antd';
import { DownOutlined, ExclamationCircleFilled, SearchOutlined } from '@ant-design/icons'
import Title from 'antd/es/typography/Title'
import path from "path";
import { useReactToPrint } from 'react-to-print'
import { getTanggalEntriColumn } from '@/app/utils/dateColumns'
import RoleProtected from '@/app/components/roleProtected/RoleProtected'

interface ExpandedDataType {
  key: React.Key;
  file: string[];
  fileType: string[];
  url: string,
  id_aset: string
}
const { confirm } = Modal;

export default function Page() {
  const [form] = Form.useForm<DataAset>()
  const [asetData, setAsetData] = useState<DataAset[]>();
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(true);
  const [isEdit, setIsEdit] = useState<boolean>(false)
  const [isAddDocument, setIsAddDocument] = useState<boolean>(false)
  const [maxId, setMaxId] = useState<number>(0)
  const [searchText, setSearchText] = useState<string>('')

  const column: TableColumnsType<any> = [
    { title: "Nomor", dataIndex: 'no', key: 'no', width: 75 },
    { title: "ID Aset", dataIndex: 'id_aset', key: 'id_aset', width: 150 },
    {
      title: "Tipe Aset",
      dataIndex: 'tipe_aset',
      key: 'tipe_aset',
      width: 100,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Cari Tipe Aset"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Cari
          </Button>
          <Button onClick={() => clearFilters && clearFilters()} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </div>
      ),
      filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilter: (value, record) => record.tipe_aset.toLowerCase().includes(String(value).toLowerCase()),
    },
    { title: "Nama Aset", dataIndex: 'nama_aset', key: 'nama_aset', width: 100 },
    {
      title: "Cabang",
      dataIndex: 'cabang',
      key: 'cabang',
      width: 150,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Cari Cabang"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Cari
          </Button>
          <Button onClick={() => clearFilters && clearFilters()} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </div>
      ),
      filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilter: (value, record) => record.cabang.toLowerCase().includes(String(value).toLowerCase()),
    },
    {
      title: "Kota",
      dataIndex: 'kota',
      key: 'kota',
      width: 100,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Cari Kota"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Cari
          </Button>
          <Button onClick={() => clearFilters && clearFilters()} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </div>
      ),
      filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilter: (value, record) => record.kota.toLowerCase().includes(String(value).toLowerCase()),
    },
    { title: "Alamat", dataIndex: 'alamat', key: 'alamat', width: 150 },
    { title: "No. tlp", dataIndex: 'no_tlp', key: 'no_tlp', width: 100 },
    getTanggalEntriColumn(150),
    {
      title: "Action",
      key: "action",
      width: 350,
      render: (_, record) => (
        <Dropdown.Button
      placement="bottomLeft"
      trigger={["click"]}
      size="small"
      icon={<DownOutlined />}
      menu={{
        items: [
          {
            key: 1,
            label: (
              <ConfigProvider
                theme={{
                  components: {
                    Button: {
                      colorPrimary: '#00b96b',
                      colorPrimaryHover: '#00db7f',
                    },
                  },
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
              <RoleProtected allowedRoles={["admin", "supervisor"]} actionType="edit" createdAt={record.created_at}>
                {({ disabled }) => (
                  <a
                    className={`text-blue-500 hover:text-blue-700 ${disabled ? 'pointer-events-none opacity-50' : ''}`}
                    onClick={() => {
                      if (!disabled) {
                        setOpenModal(true);
                        setIsEdit(true);
                        setIsAddDocument(false);
                        form.setFieldsValue(record);
                      }
                    }}
                  >
                    Edit
                  </a>
                )}
              </RoleProtected>
            ),
          },
          {
            key: 3,
            label: (
              <RoleProtected allowedRoles={["admin", "supervisor", "reporter"]} actionType="add">
                {({ disabled }) => (
                  <a
                    className="text-blue-500 hover:text-blue-700"
                    onClick={() => {
                      if (!disabled) {
                        setOpenModal(true);
                        setIsEdit(false);
                        setIsAddDocument(true);
                        form.setFieldsValue(record);
                      }
                    }}
                  >
                    Tambah Dokumen
                  </a>
                )}
              </RoleProtected>
            ),
          },
          {
            key: 4,
            label: (
              <RoleProtected allowedRoles={["admin"]} actionType="delete">
                {({ disabled }) => (
                  <a
                    className={`text-red-500 hover:text-red-700 ${disabled ? 'pointer-events-none opacity-50' : ''}`}
                    onClick={() => {
                      if (!disabled) {
                        confirm({
                          title: "Are you sure delete this asset?",
                          icon: <ExclamationCircleFilled />,
                          content: `Nama Aset: ${record.nama_aset}`,
                          okText: "Yes",
                          okType: "danger",
                          onOk() {
                            async function deleteAset() {
                              const result = await fetch("/api/master/aset/delete", {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                  id: record.id,
                                  id_aset: record.id_aset,
                                  nama_aset: record.nama_aset,
                                }),
                              });
                              if (result.status === 200) {
                                message.success("Delete berhasil");
                              } else {
                                message.error("Delete gagal");
                              }
                              setTriggerRefresh(!triggerRefresh);
                            }
                            deleteAset();
                          },
                          onCancel() {
                            console.log("Cancel");
                          },
                        });
                      }
                    }}
                  >
                    Delete
                  </a>
                )}
              </RoleProtected>
            ),
          },
        ],
      }}
    >
      Actions
    </Dropdown.Button>
      ),
    }
  ]

  const componentRef = useRef(null)
  const file_extension: string[] = ['.xlsx', '.xls', '.doc', '.docx']
  const [print, setPrint] = useState<boolean>(false)
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onBeforeGetContent: () => {
      return new Promise<void>((resolve) => {
        setPrint(true)
        resolve()
      })
    },
    onAfterPrint: () => {
      setPrint(false)
    }
  })

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

  useEffect(() => {
    getData()
  }, [triggerRefresh])

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
      <Flex className='pb-5' gap={'small'} vertical={false} justify='space-between'>
        <Button onClick={() => { setOpenModal(true); setIsEdit(false) }}>Tambah Aset</Button>
      </Flex>
      <div>
        <div className='print-table-container'>
          <Table className='overflow-auto'
            columns={print ? column.filter(col => col.key !== 'no' && col.key !== 'action') : column}
            pagination={{ pageSize: 100 }}
            expandable={print ? {} : {
              fixed: 'left',
              expandedRowRender: (record) => {
                const columns = [
                  { title: 'Jenis Dokumen', dataIndex: 'fileType', key: 'fileType' },
                  {
                    title: 'File',
                    dataIndex: 'file',
                    key: 'file',
                    render(value: string[], record: ExpandedDataType) {
                      return <ul>
                        {record.file.filter(filename => !filename.startsWith('___pdf___')).map(
                          (value, idx) => (
                            <li key={idx}>
                              <a href={`/upload/docs/${record.url}/${value}`} target="_blank" rel="noopener noreferrer">{value}</a>
                            </li>
                          )
                        )}
                      </ul>
                    },
                  },
                  {
                    title: 'Action',
                    dataIndex: 'operation',
                    key: 'operation',
                    render: (value: any, record: ExpandedDataType, index: number) => (
                      <Flex gap='small'>
                        <Popconfirm title="sure to delete this file(s)?"
                          onConfirm={
                            async function deleteAset() {
                              const result = await fetch('/api/master/aset/delete', {
                                method: "POST",
                                headers: { 'Content-Type': 'application/json' },
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
                        <Dropdown.Button placement="bottomLeft" trigger={['click']} size="small" icon={<DownOutlined />}
                          menu={{
                            items: record.file.map((v, idx) => {
                              const extension: string = path.extname(v).toLowerCase();
                              if (file_extension.includes(extension)) {
                                return {
                                  key: idx,
                                  label: (<a href={`/upload/docs/${record.url}/___pdf___${v.replaceAll(extension, '.pdf')}`} target="_blank" rel="noopener noreferrer">{v}</a>)
                                }
                              }
                              return {
                                key: idx,
                                label: (<a href={`/upload/docs/${record.url}/${v}`} target="_blank" rel="noopener noreferrer">{v}</a>)
                              }
                            })
                          }}>Print</Dropdown.Button>
                      </Flex>
                    ),
                  },
                ]
                const newDataSource: ExpandedDataType[] = record.list_dir_files.map((value: any, idx: number) => ({
                  fileType: Object.keys(value),
                  key: idx,
                  file: Object.values(value).flat() as string[],
                  url: record.id_aset.replaceAll(" ", "_") + "/" + Object.keys(value),
                  id_aset: record.id_aset
                }))
                return <Table size='small' columns={columns} dataSource={newDataSource} pagination={false} />
              }
            }}
            dataSource={asetData}
            rowKey='id'
            size='small'
            loading={asetData ? false : true}
          />
        </div>
      </div>
    </>
  )
}
