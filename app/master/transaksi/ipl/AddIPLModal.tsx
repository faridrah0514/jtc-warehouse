import { Button, Form, Modal, Select, message, UploadProps, GetProp, DatePicker, FormInstance, UploadFile } from 'antd'
import React, { useState } from 'react'
import { _renderCurrency } from '@/app/utils/renderCurrency';

interface Status {
  openModal: boolean,
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>,
  triggerRefresh: boolean,
  setTriggerRefresh: React.Dispatch<React.SetStateAction<boolean>>
  form: FormInstance,
}

export default function AddIPLModal(props: Status) {
  const [uploading, setUploading] = useState(false);

  async function addTagihanIPL(value: any) {
    setUploading(true)
    value.bulan_ipl = value.bulan_ipl.format('YYYY-MM').toString()
    fetch('/api/master/transaksi/ipl', {
      method: 'POST', body:
        JSON.stringify({
          requestType: 'add',
          data: value,
        })
      ,
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((res) => res.json())
      .then((res) => {
        if (res.status == 200) {
          message.success("Tambah IPL berhasil")
        }else if (res.status == 204) {
          message.error(res['message'])
        } else {
          message.error("Tambah IPL gagal")
        }
      })
      .catch(() => message.error("Tambah IPL gagal"))
      .finally(() => {
        props.setOpenModal(false)
        setUploading(false)
      })
    props.setTriggerRefresh(!props.triggerRefresh)
    props.form.resetFields()
  }
  return (
    <Modal open={props.openModal} footer={null} title='Form Tagihan IPL' closeIcon={null}>
      <Form layout='horizontal' form={props.form} onFinish={addTagihanIPL} labelAlign='left'>
        <Form.Item name='bulan_ipl' label="Bulan IPL" required rules={[{ required: true }]}>
          <DatePicker allowClear={false} format={'MM-YYYY'} picker='month' />
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
