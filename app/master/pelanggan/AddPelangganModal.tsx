import { Button, Form, FormInstance, Input, Modal, message } from 'antd'
import React, { useState } from 'react'
import { DataPelanggan } from '@/app/types/master'
import TextArea from 'antd/es/input/TextArea'
interface Status {
  openModal: boolean,
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>,
  triggerRefresh: boolean,
  setTriggerRefresh: React.Dispatch<React.SetStateAction<boolean>>,
  form: FormInstance,
  isEdit: boolean,
}

export default function AddPelangganModal(props: Status) {

  const [uploading, setUploading] = useState(false);

  async function addPelanggan(value: DataPelanggan) {
    setUploading(true)
    if (props.isEdit) {
      fetch('/api/master/pelanggan/add', {
        method: 'POST', body: JSON.stringify({
          requestType: 'edit',
          data: value
        }), headers: {
          'Content-Type': 'application/json',
        },
      }).then((res) => res.json())
        .then((res) => {
          if (res.status == 200) {
            message.success("Edit pelanggan berhasil")
          } else {
            message.error("Edit pelanggan gagal")
          }
        })
        .catch(() => message.error("Edit pelanggan gagal"))
        .finally(() => {
          props.setOpenModal(false)
          setUploading(false)
        })
    } else {
      fetch('/api/master/pelanggan/add', {
        method: 'POST', body: JSON.stringify({
          requestType: 'add',
          data: value
        }), headers: {
          'Content-Type': 'application/json',
        },
      }).then((res) => res.json())
        .then((res) => {
          if (res.status == 200) {
            message.success("Tambang pelanggan berhasil")
          } else {
            message.error("Tambah pelanggan gagal")
          }

        })
        .catch(() => message.error("Tambah pelanggan gagal"))
        .finally(() => {
          props.setOpenModal(false)
          setUploading(false)
        })
    }
    props.setTriggerRefresh(!props.triggerRefresh)
    props.form.resetFields()
  }

  return (
    <Modal open={props.openModal} footer={null} title='Form Tambah Pelanggan' closeIcon={null}>
      <Form form={props.form} layout='vertical' autoComplete='off' onFinish={addPelanggan}>
        {props.isEdit &&
          <Form.Item name='id' required label="id" rules={[{ required: true }]} hidden>
            <Input placeholder='id' autoComplete='off' />
          </Form.Item>
        }
        <Form.Item name='nama' required label="Nama" rules={[{ required: true }]}>
          <Input placeholder='Nama' autoComplete='off' />
        </Form.Item>
        <Form.Item name='alamat' required label='Alamat' rules={[{ required: true }]}>
          <TextArea rows={4} placeholder='Alamat' autoComplete='new-password' />
        </Form.Item>
        <Form.Item name='kota' required label='Kota' rules={[{ required: true }]}>
          <Input placeholder='Kota' autoComplete='new-password' />
        </Form.Item>
        <Form.Item name='no_tlp' required label='No. Tlp' rules={[{ pattern: new RegExp(/^[0-9]+$/), message: 'No. Tlp tidak valid' }]}>
          <Input placeholder='No. Tlp' autoComplete='off' />
        </Form.Item>
        <Form.Item name='nama_kontak' required label='Nama Kontak' rules={[{ required: true }]}>
          <Input placeholder='Contact Person' autoComplete='off' />
        </Form.Item>
        <div className="flex justify-end gap-2">
          <Form.Item>
            <Button onClick={() => {
              props.setOpenModal(false);
              props.form.resetFields()
            }}>Cancel</Button>
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" type="primary" loading={uploading}>{uploading ? 'Uploading' : 'Submit'}</Button>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  )
}
