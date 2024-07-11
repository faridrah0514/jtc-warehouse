import { Button, Form, Modal, Select, message, UploadProps, GetProp, DatePicker, FormInstance, UploadFile } from 'antd'
const { Option } = Select;
import React, { useEffect, useState } from 'react'
import { DataAset, DataCabang, DataPelanggan } from '@/app/types/master'
import dayjs, { Dayjs } from 'dayjs';
import { _renderCurrency } from '@/app/utils/renderCurrency';



type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0]

interface Status {
  openModal: boolean,
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>,
  triggerRefresh: boolean,
  setTriggerRefresh: React.Dispatch<React.SetStateAction<boolean>>
  form: FormInstance,
}

interface DiffPeriod { tahun: number, bulan: number }

export default function AddIPLModal(props: Status) {
  const dateFormat = 'DD-MM-YYYY'

  return (
    <Modal open={props.openModal} footer={null} title='Form Tagihan IPL' closeIcon={null}>
      <Form layout='horizontal' form={props.form}
        onFinish={
          async function addTagihanIPL(value) {
            value.bulan_ipl = value.bulan_ipl.format('YYYY-MM').toString()
            const result = await fetch('/api/master/transaksi/ipl', {
              method: 'POST', body:
                JSON.stringify({
                  requestType: 'add',
                  data: value,
                })
              ,
              headers: {
                'Content-Type': 'application/json',
              },
            })
            const msg = await result.json()
            if (msg.status == 204){
              message.error(msg['message'])
            }
            props.setOpenModal(false)
            props.setTriggerRefresh(!props.triggerRefresh)
            props.form.resetFields()
          }
        }
        labelAlign='left'
      >
          <Form.Item name='bulan_ipl' label="Bulan IPL" required rules={[{ required: true }]}>
            <DatePicker
              allowClear={false}
              format={'MM-YYYY'}
              picker='month'
            />
          </Form.Item>
        <div className="flex justify-end gap-2">
          <Form.Item>
            <Button onClick={() => {
              props.setOpenModal(false);
              props.form.resetFields()
            }}>Cancel</Button>  
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" type="primary"> Submit</Button>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  )
}
