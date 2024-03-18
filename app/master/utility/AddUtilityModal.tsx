import { Button, Form, Input, Modal } from 'antd'
import React from 'react'
import { DataUtility } from '@/app/types/master'
import TextArea from 'antd/es/input/TextArea'
interface Status {
  openModal: boolean,
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>,
  triggerRefresh: boolean,
  setTriggerRefresh: React.Dispatch<React.SetStateAction<boolean>>
}

export default function AddUtilityModal( props : Status) {
  const [form] = Form.useForm<DataUtility>()
  return (
    <Modal open={props.openModal} footer={null} title='Form Tambah Utility'>
        <Form form={form} layout='vertical'
        onFinish={
          async function addPelanggan(value: DataUtility) {
            const result = await fetch('/api/master/utility/add', {
              method: 'POST', body: JSON.stringify(value), headers: {
                'Content-Type': 'application/json',
              },
            })
            props.setOpenModal(false)
            props.setTriggerRefresh(!props.triggerRefresh)
          }
        }
      >
        <Form.Item name='IPL' required label="IPL" rules={[{ required: true }]}>
          <Input placeholder='IPL' />
        </Form.Item>
        <Form.Item name='kota' required label='Kota' rules={[{ required: true }]}>
          <Input placeholder='Kota' />
        </Form.Item>
        <Form.Item name='awal' required label='No. Tlp' rules={[{ pattern: new RegExp(/^[0-9]+$/), message: 'No. Tlp tidak valid' }]}>
          <Input placeholder='No. Tlp' />
        </Form.Item>
        <Form.Item name='akhir' required label='No. Tlp' rules={[{ pattern: new RegExp(/^[0-9]+$/), message: 'No. Tlp tidak valid' }]}>
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
