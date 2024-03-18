import { Button, Form, FormInstance, Input, Modal } from 'antd'
import React from 'react'
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
  return (
    <Modal open={props.openModal} footer={null} title='Form Tambah Pelanggan'>
      <Form form={props.form} layout='vertical'
        onFinish={
          async function addPelanggan(value: DataPelanggan) {
            if (props.isEdit) {
              const result = await fetch('/api/master/pelanggan/add', {
                method: 'POST', body: JSON.stringify({
                  requestType: 'edit',
                  data: value
                }), headers: {
                  'Content-Type': 'application/json',
                },
              })
            } else {
              const result = await fetch('/api/master/pelanggan/add', {
                method: 'POST', body: JSON.stringify({
                  requestType: 'add',
                  data: value
                }), headers: {
                  'Content-Type': 'application/json',
                },
              })
            }
            props.setOpenModal(false)
            props.setTriggerRefresh(!props.triggerRefresh)
          }
        }
      >
        {props.isEdit &&
          <Form.Item name='id' required label="id" rules={[{ required: true }]} hidden>
            <Input placeholder='id' />
          </Form.Item>

        }
        <Form.Item name='nama' required label="Nama" rules={[{ required: true }]}>
          <Input placeholder='Nama' />
        </Form.Item>
        <Form.Item name='alamat' required label='Alamat' rules={[{ required: true }]}>
          <TextArea rows={4} placeholder='Alamat' />
        </Form.Item>
        <Form.Item name='kota' required label='Kota' rules={[{ required: true }]}>
          <Input placeholder='Kota' />
        </Form.Item>
        <Form.Item name='no_tlp' required label='No. Tlp' rules={[{ pattern: new RegExp(/^[0-9]+$/), message: 'No. Tlp tidak valid' }]}>
          <Input placeholder='No. Tlp' />
        </Form.Item>
        <Form.Item name='contact_person' required label='Contact Person' rules={[{ required: true }]}>
          <Input placeholder='Contact Person' />
        </Form.Item>
        <div className="flex justify-end gap-2">
          <Form.Item>
            <Button onClick={() => { props.setOpenModal(false) }}>Cancel</Button>
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" type="primary">Submit</Button>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  )
}
