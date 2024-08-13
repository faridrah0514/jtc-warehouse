'use client'
import React, { useEffect, useRef, useState } from 'react'

import { Button, ConfigProvider, Divider, Dropdown, Flex, Form, Modal, Popconfirm, Select, Space, Table, TableProps, message } from 'antd'
import AddAssetModal from './AddAssetModal'
import { DataCabang, DataAset } from '@/app/types/master'
import Link from 'next/link'
import type { TableColumnsType } from 'antd';
import { DownOutlined, ExclamationCircleFilled } from '@ant-design/icons'
import Title from 'antd/es/typography/Title'
import path from "path";
import { useReactToPrint } from 'react-to-print'

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

  const column: TableColumnsType<any> = [
    { title: "Nomor", dataIndex: 'no', key: 'no', width: 75 },
    { title: "ID Aset", dataIndex: 'id_aset', key: 'id_aset', width: 150 },
    { title: "Tipe Aset", dataIndex: 'tipe_aset', key: 'tipe_aset', width: 100 },
    { title: "Nama Aset", dataIndex: 'nama_aset', key: 'nama_aset', width: 100 },
    { title: "Cabang", dataIndex: 'cabang', key: 'cabang', width: 150, filters: Array.from(new Set(asetData?.map((val: any, idx: number) => val.cabang))).map((v, i) => { return { text: v, value: v } }), onFilter: (val, record) => record.cabang.indexOf(val as string) === 0 },
    { title: "Alamat", dataIndex: 'alamat', key: 'alamat', width: 150 },
    {
      title: "Kota", dataIndex: 'kota', key: 'kota', width: 100, filters: Array.from(new Set(asetData?.map((val: any, idx: number) => val.kota))).map((v, i) => { return { text: v, value: v } }), onFilter: (val, record) =>
        record.kota.indexOf(val as string) === 0
    },
    { title: "No. tlp", dataIndex: 'no_tlp', key: 'no_tlp', width: 100 },
    {
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
    }
  ]

  const componentRef = useRef(null)
  const file_extension: string[] = ['.xlsx', '.xls', '.doc', '.docx']
  // const [printColumns, setPrintColumns] = useState(column);
  const [print, setPrint] = useState<boolean>(false)
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onBeforeGetContent: () => {
      return new Promise<void>((resolve) => {
          setPrint(true)
        resolve()
      })
    },
    onBeforePrint: () => {

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

  useEffect(
    () => {
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
      <Flex className='pb-5' gap={'small'} vertical={false} justify='space-between'>
        <Button onClick={() => { setOpenModal(true); setIsEdit(false) }}>Tambah Aset</Button>
        {/* <Button onClick={handlePrint}>Print Laporan</Button> */}
      </Flex>

      <div ref={componentRef}>
        <div className='print-only mb-10'>
          <Title level={3} style={{ margin: 0 }}>DATA ASET MILIK PT.JTC WAREHOUSE</Title>
          <Title level={3} style={{ margin: 0 }}>Kantor pusat: xxxxxx, email: xxxx</Title>
          <Title level={4} style={{ margin: 0 }}>No. tlp: 0812xxxxx</Title>
          <Divider></Divider>
        </div>
        <div className='print-table-container'>
          <Table className='overflow-auto'
            columns={print ? column.filter(col => col.key !== 'no' && col.key !== 'action') : column}
            expandable={print ? {} : {
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
                          <Dropdown.Button placement="bottomLeft" trigger={['click']} size="small" icon={<DownOutlined />}
                            menu={{
                              items: record.file.map((v, idx) => {
                                if (!v.startsWith('___pdf___')) {
                                  const extension: string = path.extname(v).toLowerCase();
                                  if (file_extension.includes(extension)) {
                                    return {
                                      key: idx, label: (<a href={`/upload/docs/${record.url}/___pdf___${v.replaceAll(extension, '.pdf')}`} target="_blank" rel="noopener noreferrer" onClick={() => {
                                        const printWindow = window.open(`/upload/docs/${record.url}/___pdf___${v.replaceAll(extension, '.pdf')}`);
                                        printWindow?.print();
                                      }}>{v}</a>)
                                    }
                                  }
                                  return {
                                    key: idx, label: (<a href={`/upload/docs/${record.url}/${v}`} target="_blank" rel="noopener noreferrer" onClick={() => {
                                      const printWindow = window.open(`/upload/docs/${record.url}/${v}`);
                                      printWindow?.print();
                                    }}>{v}</a>)
                                  }
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
                const newDataSource: ExpandedDataType[] = record.list_dir_files.map(
                  (value: any, idx: number) => {
                    return {
                      fileType: Object.keys(value),
                      key: idx,
                      file: Object.values(value).flat() as string[],
                      url: record.id_aset.replaceAll(" ", "_") + "/" + Object.keys(value),
                      id_aset: record.id_aset
                    }
                  }
                )
                return <Table size='small' columns={columns} dataSource={newDataSource} pagination={false} />
              }
            }}
            dataSource={asetData}
            rowKey='id'
            size='small'
            loading={asetData ? false : true}
            bordered
          />
        </div >
      </div>
      <style jsx global>{`
        .print-only {
          display: none;
        }

        .no-print {
          display: block;
        }

        .print-table-container {
          display: block;
          width: 100%;
          overflow-x: auto;
        }

        @media print {
          @page {
            size: landscape;
            margin: 5mm;
          }

          .print-only {
            text-align: center;
            display: block;
          }

          .no-print {
            display: none;
          }

          .print-table-container {
            display: block;
            margin: 0 auto;
            width: auto;
            max-width: 100%;
          }

          .ant-table-pagination {
            display: none !important;
          }
        }
    `}</style>
    </>
  )
}
