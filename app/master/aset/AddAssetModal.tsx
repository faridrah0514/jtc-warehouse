import { Button, Form, Input, Modal, Select, UploadFile, Upload, message, UploadProps, GetProp } from 'antd'
const { Option } = Select;
import TextArea from 'antd/es/input/TextArea'
import React, { useEffect, useRef, useState } from 'react'
import { DataAset, DataCabang } from '@/app/types/master'
import { UploadOutlined } from '@ant-design/icons';
import { projectRoot } from '@/app/projectRoot';

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0]

interface Status {
  openModal: boolean,
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>,
  triggerRefresh: boolean,
  setTriggerRefresh: React.Dispatch<React.SetStateAction<boolean>>
}

export default function AddAssetModal(props: Status) {
  const [form] = Form.useForm<DataAset>()
  const [allCabang, setAllCabang] = useState<{id: number, nama_perusahaan: string}[]>([])
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  useEffect(
    () => {
      async function getAllCabang() {
        const response = await fetch('/api/master/cabang', { method: 'GET' })
        const dataCabang = (await response.json()).data.map((value: DataCabang) => {
          return { id: value.id, nama_perusahaan: value.nama_perusahaan }
        })
        if (dataCabang) {
          setAllCabang(dataCabang)
        }
      }
      getAllCabang()
    }, []
  )

  const uploadProps: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file)
      const newFileList = fileList.slice()
      newFileList.splice(index, 1)
      setFileList(newFileList)
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file])
      return false
    },
    fileList

  }
  return (
    <Modal open={props.openModal} footer={null} title='Form Tambah Aset' closeIcon={null}>
      <Form form={form} layout='vertical'
        onFinish={
          async function addAset(value: DataAset) {
            //Insert Data to Database
            const result = await fetch('/api/master/aset/add', {
              method: 'POST', body: JSON.stringify(value), headers: {
                'Content-Type': 'application/json',
              },
            })

            // Upload File to Server            
            if (fileList.length != 0) {
              const formData = new FormData()
              formData.append('nama_aset', value.nama_aset)
              formData.append('id_aset', value.id_aset)
              fileList.forEach(
                (file) => {
                  formData.append('files[]', file as FileType)
                }
              )
              setUploading(true)
              fetch('/api/master/aset/upload', {
                method: 'POST',
                body: formData
              }).then((res) => res.json())
                .then((res) => {
                  setFileList([])
                  if (res.status == 200) {
                    message.success("upload success")
                  } else {
                    message.error("upload failed")
                  }
  
                })
                .catch(() => message.error("upload failed"))
                .finally(() => setUploading(false))
            }
            props.setOpenModal(false)
            props.setTriggerRefresh(!props.triggerRefresh)
            form.resetFields()
          }
        }
      >
        <Form.Item name='id_aset' required label="ID Aset" rules={[{ required: true }]}>
          <Input placeholder='ID Aset' />
        </Form.Item>
        <Form.Item name='tipe_aset' required label="Tipe Aset" rules={[{ required: true }]}>
          <Input placeholder='Tipe Aset' />
        </Form.Item>
        <Form.Item name='nama_aset' required label="Nama Aset" rules={[{ required: true }]}>
          <Input placeholder='Nama Asset' />
        </Form.Item>
        <Form.Item name='id_cabang' required label="Cabang" rules={[{ required: true }]}>
          <Select placeholder="Cabang" allowClear>
            {allCabang.map(
              (value) => <Option key={value.id} value={value.id}>{value.nama_perusahaan}</Option>
            )}
          </Select>
        </Form.Item>
        <Form.Item name='alamat' required label='Alamat' rules={[{ required: true }]}>
          <TextArea rows={4} placeholder='Alamat' />
        </Form.Item>
        <Form.Item name='kota' required label='Kota' rules={[{ required: true }]}>
          <Input placeholder='Kota' />
        </Form.Item>
        <Form.Item name='status' required label='Status' rules={[{ required: true }]}>
          <Input placeholder='Status' />
        </Form.Item>
        <Form.Item name='upload' label='Upload Dokumen'>
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>Upload</Button>
          </Upload>
        </Form.Item>
        <div className="flex justify-end gap-2">
          <Form.Item>
            <Button onClick={() => { props.setOpenModal(false) }}>Cancel</Button>
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" type="primary" loading={uploading}> {uploading ? 'Uploading' : 'Submit'}</Button>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  )
}
