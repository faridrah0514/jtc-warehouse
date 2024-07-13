import { Button, Form, FormInstance, Input, InputNumber, Modal, Space, message } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import React, { useState } from 'react'
import { DataCabang } from '@/app/types/master'
import { CurrencyInput } from '@/app/components/currencyInput/currencyInput'
import { SearchOutlined } from '@ant-design/icons'

interface Status {
  openModal: boolean,
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>,
  triggerRefresh: boolean,
  setTriggerRefresh: React.Dispatch<React.SetStateAction<boolean>>,
  form: FormInstance,
  isEdit: boolean
}

export default function AddCabangModal(props: Status) {

  const [currencyValue, setCurrencyValue] = useState<number>(0)
  const [uploading, setUploading] = useState(false);

  async function addGudang(value: DataCabang) {
    setUploading(true)
    if (props.isEdit) {
      fetch('/api/master/cabang/add', {
        method: 'POST',
        body: JSON.stringify({
          requestType: 'edit',
          data: value
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((res) => res.json())
        .then((res) => {
          if (res.status == 200) {
            message.success("Edit cabang berhasil")
          } else {
            message.error("Edit cabang gagal")
          }

        })
        .catch(() => message.error("Edit cabang gagal"))
        .finally(() => {
          props.setOpenModal(false)
          setUploading(false)
        })
    } else {
      fetch('/api/master/cabang/add', {
        method: 'POST', body: JSON.stringify({
          requestType: 'add',
          data: value
        }), headers: {
          'Content-Type': 'application/json',
        },
      }).then((res) => res.json())
        .then((res) => {
          if (res.status == 200) {
            message.success("Tambah cabang berhasil")
          } else {
            message.error("Tambah cabang gagal")
          }

        })
        .catch(() => message.error("Tambah cabang gagal"))
        .finally(() => {
          props.setOpenModal(false)
          setUploading(false)
        })
    }
    props.setTriggerRefresh(!props.triggerRefresh)
    props.form.resetFields()
  }

  return (
    <Modal open={props.openModal} footer={null} title='Form Tambah Cabang' closeIcon={null} width={800} >
      <Form form={props.form} layout='vertical' autoComplete='off' onFinish={addGudang}>
        {props.isEdit &&
          <Form.Item name='id' required label="id" rules={[{ required: true }]} hidden>
            <Input placeholder='id' autoComplete='off' />
          </Form.Item>
        }
        <Form.Item name='nama_perusahaan' required label="Nama Perusahaan" rules={[{ required: true }]}>
          <Input placeholder='Nama Perusahaan' autoComplete='off' />
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
        <Form.Item name='status' required label='Status' rules={[{ required: true }]}>
          <Input placeholder='Status' autoComplete='off' />
        </Form.Item>
        <Form.Item name='kwh_rp' required label='Kwh Rp' rules={[{ required: true, pattern: new RegExp(/^[0-9]+$/), message: 'Input Kwh tidak valid' }]}>
          {/* <Input placeholder='Kwh Rp' autoComplete='off'/> */}
          <CurrencyInput value={currencyValue} onChange={(value) => setCurrencyValue(() => value)} />
        </Form.Item>
        <Form.Item label="Nomor Rekening 1">
          <Space.Compact>
            <Form.Item name="rek_bank_1">
              <Input addonBefore='BANK' placeholder="BANK" />
            </Form.Item>
            <Form.Item name="rek_norek_1">
              <Input addonBefore='Nomor Rekening' placeholder="Nomor Rekening" />
            </Form.Item>
            <Form.Item name="rek_atas_nama_1">
              <Input addonBefore='Atas Nama' placeholder="Atas Nama" />
            </Form.Item>
          </Space.Compact>
        </Form.Item>
        <Form.Item label="Nomor Rekening 2">
          <Space.Compact >
            <Form.Item name="rek_bank_2">
              <Input addonBefore='BANK' placeholder="BANK" />
            </Form.Item>
            <Form.Item name="rek_norek_2">
              <Input addonBefore='Nomor Rekening' placeholder="Nomor Rekening" />
            </Form.Item>
            <Form.Item name="rek_atas_nama_2">
              <Input addonBefore='Atas Nama' placeholder="Atas Nama" />
            </Form.Item>
          </Space.Compact>
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
