import { Button, Form, FormInstance, Input, InputNumber, Modal } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import React from 'react'
import { DataCabang } from '@/app/types/master'

interface Status {
  openModal: boolean,
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>,
  triggerRefresh: boolean,
  setTriggerRefresh: React.Dispatch<React.SetStateAction<boolean>>,
  form: FormInstance,
  isEdit: boolean
}

export default function AddCabangModal(props: Status) {
  return (
    <Modal open={props.openModal} footer={null} title='Form Tambah Cabang' closeIcon={null}>
      <Form form={props.form} layout='vertical'
        onFinish={
          async function addGudang(value: DataCabang) {
            if (props.isEdit) {
              const result = await fetch('/api/master/cabang/add', {
                method: 'POST',
                body: JSON.stringify({
                  requestType: 'edit',
                  data: value
                }),
                headers: {
                  'Content-Type': 'application/json',
                },
              })
            } else {
              const result = await fetch('/api/master/cabang/add', {
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
            props.form.resetFields()
          }
        }
      >
        {props.isEdit &&
          <Form.Item name='id' required label="id" rules={[{ required: true }]} hidden>
            <Input placeholder='id' />
          </Form.Item>
        }
        <Form.Item name='nama_perusahaan' required label="Nama Perusahaan" rules={[{ required: true }]}>
          <Input placeholder='Nama Perusahaan' />
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
        <Form.Item name='status' required label='Status' rules={[{ required: true }]}>
          <Input placeholder='Status' />
        </Form.Item>
        <Form.Item name='kwh_rp' required label='Kwh Rp' rules={[{ required: true, pattern: new RegExp(/^[0-9]+$/), message: 'Input Kwh tidak valid'  }]}>
          <Input placeholder='Kwh Rp' />
        </Form.Item>
        <div className="flex justify-end gap-2">
          <Form.Item>
            <Button onClick={() => {
              props.setOpenModal(false);
              props.form.resetFields()
            }}>Cancel</Button>
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" type="primary">Submit</Button>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  )
}
