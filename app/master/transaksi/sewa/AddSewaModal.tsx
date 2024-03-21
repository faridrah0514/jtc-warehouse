import { Button, Form, Input, Modal, Select, UploadFile, Upload, message, UploadProps, GetProp, DatePicker, Flex } from 'antd'
const { Option } = Select;
import TextArea from 'antd/es/input/TextArea'
import React, { useEffect, useRef, useState } from 'react'
import { DataAset, DataCabang, DataPelanggan } from '@/app/types/master'
import { UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0]

interface Status {
  openModal: boolean,
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>,
  triggerRefresh: boolean,
  setTriggerRefresh: React.Dispatch<React.SetStateAction<boolean>>
}

export default function AddSewaModal(props: Status) {

  const [allData, setAllData] = useState<{ cabang: any, pelanggan: any, aset: any }>({ cabang: [], pelanggan: [], aset: [] })
  const [tanggalSewa, setTanggalSewa] = useState<{startDate: string, endDate: string}>({startDate:'', endDate:''})
  const formRef = useRef(null);
  const [form] = Form.useForm<any>()

  useEffect(
    () => {
      async function getAllData() {
        const allCabang = await fetch('/api/master/cabang', { method: 'GET', cache: 'no-store' })
        const allPelanggan = await fetch('/api/master/pelanggan', { method: 'GET', cache: 'no-store' })
        const allAset = await fetch('/api/master/aset', { method: 'GET', cache: 'no-store' })
        const dataCabang = (await allCabang.json()).data.map((value: DataCabang) => {
          return { id: value.id, nama_perusahaan: value.nama_perusahaan }
        })
        const dataPelanggan = (await allPelanggan.json()).data.map((value: DataPelanggan) => { return { id: value.id, nama: value.nama } })
        const dataAset = (await allAset.json()).data.map((value: DataAset) => { return { id: value.id, nama_aset: value.nama_aset } })
        if (dataCabang || dataPelanggan || dataAset) {
          setAllData({
            cabang: dataCabang,
            pelanggan: dataPelanggan,
            aset: dataAset
          })
        }
      }
      getAllData()
    }, []
  )
  return (
    <Modal open={props.openModal} footer={null} title='Form Transaksi Sewa' closeIcon={null}>
      <Form layout='vertical' ref={formRef} form={form}
        onFinish={
          async function addSewa(value) {
            const dateFormat = 'YYYY-MM-DD'
            value.start_date_sewa = value.start_date_sewa.format(dateFormat).toString()
            value.end_date_sewa = value.end_date_sewa.format(dateFormat).toString()
            const result = await fetch('/api/master/transaksi/sewa', {
              method: 'POST', body: JSON.stringify(value), headers: {
                'Content-Type': 'application/json',
              },
            })
            props.setOpenModal(false)
            props.setTriggerRefresh(!props.triggerRefresh)
            // if (formRef.current) formRef.current.resetFields();
            form.resetFields()
            
          }
        }
      >
        <Form.Item name='id_cabang' required label="Nama Cabang" rules={[{ required: true }]}>
          <Select placeholder="Cabang" allowClear>
            {allData.cabang.map(
              (value: any) => <Option key={value.id} value={value.id}>{value.nama_perusahaan}</Option>
            )}
          </Select>
        </Form.Item>
        <Form.Item name='id_aset' required label="Nama Aset" rules={[{ required: true }]}>
          <Select placeholder="Aset" allowClear>
            {allData.aset.map(
              (value: any) => <Option key={value.id} value={value.id}>{value.nama_aset}</Option>
            )}
          </Select>
        </Form.Item>
        <Form.Item name='id_pelanggan' required label="Nama Pelanggan" rules={[{ required: true }]}>
          <Select placeholder="Pelanggan" allowClear>
            {allData.pelanggan.map(
              (value: any) => <Option key={value.id} value={value.id}>{value.nama}</Option>
            )}
          </Select>
        </Form.Item>
        <Flex gap='large'>
          <Form.Item name='start_date_sewa' required label='Tanggal Awal Sewa' rules={[{ required: true }]}>
            <DatePicker allowClear={false} onChange={(date, dateString) => {
              setTanggalSewa({ startDate: date.format('YYYY-MM-DD').toString(), endDate: tanggalSewa.endDate})
            }}></DatePicker>          
          </Form.Item>
          <Form.Item name='end_date_sewa' required label='Tanggal Akhir Sewa' rules={[{ required: true }, {validator: (rule, value: Dayjs) => {
            if (value.format('YYYY-MM-DD').toString() < tanggalSewa.startDate) {
              return Promise.reject("salah nih tanggalnya")
            }
            return Promise.resolve()
          }}]}>
            <DatePicker allowClear={false} disabled={tanggalSewa.startDate == ''}></DatePicker>
          </Form.Item>
        </Flex>
        <Form.Item name='harga' required label="Harga Sewa" rules={[
          {required: true},
        ]}>
          <Input placeholder='Harga Sewa' />
        </Form.Item>
        <div className="flex justify-end gap-2">
          <Form.Item>
            <Button onClick={() => { props.setOpenModal(false) }}>Cancel</Button>
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" type="primary"> Sumbit</Button>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  )
}
