'use client'
import React, { useEffect, useState } from 'react'

import { Button, ConfigProvider, Flex, Form, Input, Modal, Popconfirm, Table, TableProps } from 'antd'
import AddPelangganModal from './AddPelangganModal'
import { DataPelanggan } from '@/app/types/master'
import Title from 'antd/es/typography/Title'
import { SearchOutlined } from '@ant-design/icons'
import type { ColumnType, FilterDropdownProps } from 'antd/es/table/interface' // Import types

const column = (searchText: string, setSearchText: Function): ColumnType<DataPelanggan>[] => [
  { title: "Nomor", dataIndex: 'no', key: 'no' },
  {
    title: "Nama",
    dataIndex: 'nama',
    key: 'nama',
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: FilterDropdownProps) => ( // Type parameters
      <div style={{ padding: 8 }}>
        <Input
          placeholder="Cari Nama"
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
    onFilter: (value, record) =>
      String(record.nama).toLowerCase().includes(String(value).toLowerCase()), // Typecast to string
    render: (text) => (
      String(text).toLowerCase().includes(searchText.toLowerCase()) ? (
        <span>{text}</span>
      ) : text
    ),
  },
  { title: "Alamat", dataIndex: 'alamat', key: 'alamat' },
  { title: "Kota", dataIndex: 'kota', key: 'kota' },
  { title: "No Tlp", dataIndex: 'no_tlp', key: 'no_tlp' },
  { title: "Contact Person", dataIndex: 'contact_person', key: 'contact_person' }
]

export default function Page() {
  const [form] = Form.useForm()
  const [pelangganData, setPelangganData] = useState<DataPelanggan[]>();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(true);
  const [isEdit, setIsEdit] = useState<boolean>(false)
  const [searchText, setSearchText] = useState<string>('')

  useEffect(
    () => {
      async function getData() {
        const response = await fetch('/api/master/pelanggan', { method: 'GET', cache: 'no-store' })
        const data = await response.json()

        if (data) {
          data.data.map(
            (value: DataPelanggan, index: number) => {
              value.no = index + 1
              value.id_pelanggan = `PL-${value.id.toString().padStart(4, '0')}` // Formatting ID Pelanggan
            }
          )
          setPelangganData(data.data)
        }
      }
      getData()
    }, [triggerRefresh]
  )

  return (
    <>
      <Title level={3}>Halaman Data Master Pelanggan</Title>
      <Button className="mb-5" onClick={() => { setOpenModal(true) }}>Tambah Pelanggan</Button>
      <AddPelangganModal form={form} isEdit={isEdit} setOpenModal={setOpenModal} openModal={openModal} triggerRefresh={triggerRefresh} setTriggerRefresh={setTriggerRefresh} />
      <Table className='overflow-auto'
        pagination={{ pageSize: 100 }}
        columns={[...column(searchText, setSearchText), {
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
              </ConfigProvider>
              <Button type="primary" ghost size="small" onClick={
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
                  async function deleteCabang() {
                    const result = await fetch('/api/master/pelanggan/delete', {
                      method: "POST",
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ id: record.id })
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
        dataSource={pelangganData}
        rowKey='id'
        size='small'
        loading={pelangganData ? false : true}
      />
    </>
  )
}
