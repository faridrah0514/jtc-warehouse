'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Button, Divider, Flex, Form, Popconfirm, Spin, Table, Tag, Input } from 'antd'
import AddSewaModal from './AddSewaModal'
import Title from 'antd/es/typography/Title'
import dayjs from 'dayjs';
import { _renderCurrency } from '@/app/utils/renderCurrency'
import { useReactToPrint } from 'react-to-print'
import { SearchOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { getTanggalEntriColumn } from '@/app/utils/dateColumns'
import RoleProtected from '@/app/components/roleProtected/RoleProtected'

export default function Page() {
  const [sewaData, setSewaData] = useState<any[]>([]);
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(true);
  const [isEdit, setIsEdit] = useState<boolean>(false)
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm()
  const [maxId, setMaxId] = useState<number>(0)
  const [searchTextCabang, setSearchTextCabang] = useState<string>('')
  const [searchTextAset, setSearchTextAset] = useState<string>('')

  const column: TableColumnsType<any> = [
    { title: "Nomor", dataIndex: 'no', key: 'no' },
    { title: "ID Transaksi", dataIndex: 'id_transaksi', key: 'id_transaksi' },
    {
      title: "Cabang", dataIndex: 'nama_cabang', key: 'nama_cabang',
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
      onFilter: (value, record) => String(record.nama_cabang).toLowerCase().includes(String(value).toLowerCase()),
    },
    {
      title: "Aset", dataIndex: 'nama_aset', key: 'nama_aset',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Cari Aset"
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
      onFilter: (value, record) => String(record.nama_aset).toLowerCase().includes(String(value).toLowerCase()),
    },
    {
      title: "Pelanggan", dataIndex: 'nama_pelanggan', key: 'nama_pelanggan',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Cari Pelanggan"
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
      onFilter: (value, record) => String(record.nama_pelanggan).toLowerCase().includes(String(value).toLowerCase()),
    },
    { title: "Tanggal Akte", dataIndex: 'tanggal_akte_1', key: 'tanggal_akte' },
    { title: "Nomor Akte", dataIndex: 'no_akte', key: 'no_akte' },
    { title: "Notaris", dataIndex: 'notaris', key: 'notaris' },
    { title: "Tanggal Awal Sewa", dataIndex: 'start_date_sewa', key: 'start_date_sewa' },
    { title: "Tanggal Akhir Sewa", dataIndex: 'end_date_sewa', key: 'end_date_sewa' },
    { title: "Periode Pembayaran", dataIndex: 'periode_pembayaran', key: 'periode_pembayaran' },
    { title: "Harga", dataIndex: 'harga_rp', key: 'harga_rp' },
    { title: "Total Biaya Sewa", dataIndex: 'total_biaya_sewa_rp', key: 'total_biaya_sewa_rp' },
    { title: "Iuran IPL", dataIndex: 'ipl_rp', key: 'ipl_rp' },
    {
      title: "Dokumen",
      key: "dokumen",
      ellipsis: true,
      render: (_, record) => (
        <ul>
          {record.list_files.map((v: string, idx: number) => (
            <li key={idx}>
              <a href={`/upload/txs/${record.id_transaksi}/${v}`} target="_blank" rel="noopener noreferrer">{v}</a>
            </li>
          ))}
        </ul>
      )
    },
    {
      title: "Status Sewa",
      key: "status_sewa",
      render: (_, record: any) => {
        const today = dayjs();
        if (dayjs(record.start_date_sewa, "DD-MM-YYYY") > today)
          return <Tag color='processing'>Akan Datang</Tag>;
        else if (dayjs(record.start_date_sewa, "DD-MM-YYYY") <= today && today <= dayjs(record.end_date_sewa, "DD-MM-YYYY"))
          return <Tag color='success'>Aktif</Tag>;
        else
          return <Tag color='default'>Non-Aktif</Tag>;
      },
      filters: [{ text: 'Akan Datang', value: 'Akan Datang' }, { text: 'Aktif', value: 'Aktif' }, { text: 'Non-Aktif', value: 'Non-Aktif' }],
      onFilter: (val, record) => {
        const today = dayjs();
        let status = '';
        if (dayjs(record.start_date_sewa, "DD-MM-YYYY") > today)
          status = 'Akan Datang';
        else if (dayjs(record.start_date_sewa, "DD-MM-YYYY") <= today && today <= dayjs(record.end_date_sewa, "DD-MM-YYYY"))
          status = 'Aktif';
        else
          status = 'Non-Aktif';
        return val === status;
      }
    },
    getTanggalEntriColumn(),
    {
      title: "Action",
      key: "action",
      render: (_, record: any) => (
        <Flex gap="small">
          <RoleProtected allowedRoles={['admin', 'supervisor']} actionType='edit' createdAt={record.created_at}>
            <Button type="primary" ghost size="small" onClick={() => {
              setOpenModal(true);
              setIsEdit(true);
              record.tanggal_akte = dayjs(record.tanggal_akte_1, 'DD-MM-YYYY');
              record.masa_sewa = [dayjs(record.start_date_sewa, 'DD-MM-YYYY'), dayjs(record.end_date_sewa, 'DD-MM-YYYY')];
              form.setFieldsValue(record);
              setTriggerRefresh(!triggerRefresh);
            }}>
              Edit
            </Button>
          </RoleProtected>
          <RoleProtected allowedRoles={['admin']} actionType='delete'>
            <Popconfirm title="sure to delete?" onConfirm={async () => {
              const requestType = 'delete';
              await fetch('/api/master/transaksi/sewa', {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  requestType,
                  data: { id: record.id, id_transaksi: record.id_transaksi }
                })
              }).then((res) => res.json()).then((res) => {
                if (res.status == 200) {
                  setTriggerRefresh(!triggerRefresh);
                }
              });
            }}>
              <Button size="small" danger>Delete</Button>
            </Popconfirm>
          </RoleProtected>
        </Flex>
      ),
      width: 75
    }
  ];


  const [print, setPrint] = useState<boolean>(false)
  const componentRef = useRef(null)
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onBeforeGetContent: () => new Promise<void>((resolve) => {
      setPrint(true)
      resolve()
    }),
    onAfterPrint: () => setPrint(false)
  })

  async function getData() {
    try {
      const response = await fetch('/api/master/transaksi/sewa', { method: 'GET', cache: 'no-store' })
      const data = await response.json()
      if (data) {
        data.data.map((v: any, i: number) => {
          v.no = i + 1
          v.harga_rp = _renderCurrency(v.harga)
          v.total_biaya_sewa_rp = _renderCurrency(v.total_biaya_sewa)
          v.ipl_rp = _renderCurrency(v.ipl)
          return v
        })
        setSewaData(data.data)
        setMaxId(data.maxId[0].max_id)
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getData()
  }, [triggerRefresh])

  return (
    <>
      <Title level={3}>Halaman Data Master Transaksi - Sewa</Title>
      <Flex className='pb-5' gap={'small'} vertical={false}>
        <Button onClick={() => { setOpenModal(true) }}>+ Transaksi Sewa</Button>
      </Flex>
      {(loading) ?
        <div className="flex justify-center items-center">
          <Spin size="large" />
        </div>
        :
        <>
          <AddSewaModal sewaData={sewaData} maxId={maxId} form={form} isEdit={isEdit} setIsEdit={setIsEdit} setOpenModal={setOpenModal} openModal={openModal} triggerRefresh={triggerRefresh} setTriggerRefresh={setTriggerRefresh} />
          <Table className='overflow-auto'
                scroll={{ x: 2000 }}
                columns={print ? column.filter(col => col.key != 'dokumen' && col.key != 'action' && col.key != 'no_akte' && col.key != 'notaris' && col.key != 'tanggal_akte') : column}
                dataSource={sewaData?.map((item: any, index: number) => ({ ...item, key: index }))}
                rowKey='id'
                size='small'
                loading={sewaData ? false : true}
                pagination={{ pageSize: 100 }}
              />
        </>
      }
    </>
  )
}
