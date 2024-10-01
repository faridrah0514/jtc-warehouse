'use client'
import React, { useEffect, useState } from 'react'

import { Button, ConfigProvider, Flex, Form, Input, Modal, Popconfirm, Space, Table, TableProps, message } from 'antd'
import AddCabangModal from './AddCabangModal'
import { DataCabang } from '@/app/types/master'
import { useForm } from 'antd/es/form/Form'
import Title from 'antd/es/typography/Title'
import { _renderCurrency } from '@/app/utils/renderCurrency'
import { SearchOutlined } from '@ant-design/icons'
import type { ColumnType, FilterDropdownProps } from 'antd/es/table/interface'
import { getTanggalEntriColumn } from '@/app/utils/dateColumns'
import RoleProtected from '@/app/components/roleProtected/RoleProtected'

const column = (searchText: string, setSearchText: Function): ColumnType<DataCabang>[] => [
  { title: "Nomor", dataIndex: 'no', key: 'no' },
  { title: "ID Cabang", dataIndex: 'id_cabang', key: 'id_cabang' },
  {
    title: "Nama Perusahaan",
    dataIndex: 'nama_perusahaan',
    key: 'nama_perusahaan',
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: FilterDropdownProps) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder="Cari Nama Perusahaan"
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
    onFilter: (value, record) => String(record.nama_perusahaan).toLowerCase().includes(String(value).toLowerCase()),
    render: (text) => (
      text.toLowerCase().includes(searchText.toLowerCase()) ? (
        <span>{text}</span>
      ) : text
    ),
  },
  { title: "Alamat", dataIndex: 'alamat', key: 'alamat' },
  { title: "Kota", dataIndex: 'kota', key: 'kota' },
  { title: "No Tlp", dataIndex: 'no_tlp', key: 'no_tlp' },
  { title: "Status", dataIndex: 'status', key: 'status' },
  { title: "Kwh Rp", dataIndex: 'kwh_rp_1', key: 'kwh_rp_1' },
  getTanggalEntriColumn(),
]

export default function Page() {
  const [form] = Form.useForm()
  const [cabangData, setCabangData] = useState<DataCabang[]>();
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(true);
  const [isEdit, setIsEdit] = useState<boolean>(false)
  const [searchText, setSearchText] = useState<string>('')

  async function getData() {
    const response = await fetch('/api/master/cabang', { method: 'GET', cache: 'no-store' })
    const data = await response.json()

    if (data) {
      data.data.map(
        (value: DataCabang, index: number) => {
          value.no = index + 1
          value.id_cabang = 'CB-' + value.id.toString().padStart(4, "0")
          value.kwh_rp_1 = _renderCurrency(value.kwh_rp)
        }
      )
      setCabangData(
        data.data
      )
    }
  }

  useEffect(
    () => {
      getData()
    }, [triggerRefresh]
  )
  return (
    <>
      <Title level={3}>Halaman Data Master Cabang</Title>
      <Button className="mb-5" onClick={() => { setOpenModal(true); setIsEdit(false) }}>+ Tambah Cabang</Button>
      <AddCabangModal isEdit={isEdit} form={form} setOpenModal={setOpenModal} openModal={openModal} triggerRefresh={triggerRefresh} setTriggerRefresh={setTriggerRefresh} />
      <Table className='overflow-auto'
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
              <RoleProtected allowedRoles={['admin', 'supervisor']} actionType='edit' createdAt={record.created_at}>
                <Button type="primary" ghost size="small" onClick={
                  () => {
                    setOpenModal(true)
                    setIsEdit(true)
                    form.setFieldsValue(record)
                  }
                }>
                  Edit
                </Button>
              </RoleProtected>
              <RoleProtected allowedRoles={['admin']} actionType='delete'>
                <Popconfirm
                  title="sure to delete?"
                  onConfirm={
                    async function deleteCabang() {
                      const result = await (await fetch('/api/master/cabang/delete', {
                        method: "POST",
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ id: record.id })
                      })).json()
                      setTriggerRefresh(!triggerRefresh)
                      if (result.status == 200) {
                        message.success("Delete berhasil")
                      } else {
                        message.error(result.error)
                      }
                    }
                  }
                >
                  <Button size="small" danger>
                    Delete
                  </Button>
                </Popconfirm>
              </RoleProtected>
            </Flex>
          ),
        }]}
        dataSource={cabangData}
        rowKey='id'
        size='small'
        loading={cabangData ? false : true}
        pagination={{ pageSize: 100 }}
      />
    </>
  )
}
