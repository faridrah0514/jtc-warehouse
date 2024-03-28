import { Button, Form, Input, Modal, Select, UploadFile, Upload, message, UploadProps, GetProp, Col, Row, Flex } from 'antd'
const { Option } = Select;
import TextArea from 'antd/es/input/TextArea'
import React, { useEffect, useRef, useState } from 'react'
import { DataAset, DataCabang } from '@/app/types/master'
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
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
  const [allCabang, setAllCabang] = useState<{ id: number, nama_perusahaan: string }[]>([])
  const [fileList, setFileList] = useState<UploadFile[][]>([]);
  const [uploading, setUploading] = useState(false);
  const [inputs, setInputs] = useState<string[]>([]);

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

  async function addAset(value: any) {
    //Insert Data to Database
    value.doc_list = [...inputs]
    const result = await fetch('/api/master/aset/add', {
      method: 'POST', body: JSON.stringify(value), headers: {
        'Content-Type': 'application/json',
      },
    })
    inputs.forEach(
      (input, idx) => {
        const formData = new FormData()
        formData.append('nama_aset', value.nama_aset)
        formData.append('id_aset', value.id_aset)
        formData.append('doc_list', input)
        fileList[idx].forEach(
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
    )
    props.setOpenModal(false)
    props.setTriggerRefresh(!props.triggerRefresh)
    form.resetFields()
    setInputs([])
    setFileList([])
  }

  const handleAddInput = () => {
    setInputs([...inputs, '']);
    setFileList([...fileList, []])
  };

  const handleDeleteInput = (index: number) => {
    setInputs(inputs.filter((_, i) => i !== index));
    setFileList(fileList.filter((_, i) => i != index))

  };

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  return (
    <Modal open={props.openModal} footer={null} title='Form Tambah Aset' closeIcon={null} width={1500}>
      <Form form={form} layout='horizontal' labelAlign='left' labelCol={{ span: 9 }} labelWrap wrapperCol={{ span: 14 }} onFinish={addAset} name="parent_form">
        <Row gutter={20}>
          <Col span={10} className='border p-4'>
            <Form.Item name='id_aset' required label="ID Aset" rules={[{ required: true }]}>
              <Input placeholder='ID Aset' />
            </Form.Item>
            <Form.Item name='tipe_aset' required label="Tipe / Kelompok Aset" rules={[{ required: true }]}>
              <Select placeholder='Tipe Aset' allowClear>
                <Option value='Gudang'>Gudang</Option>
                <Option value='Hotel'>Hotel</Option>
                <Option value='Rumah'>Rumah</Option>
                <Option value='SPBU'>SPBU</Option>
                <Option value='Wisma'>Wisma</Option>
                <Option value='Ruko'>Ruko</Option>
              </Select>
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
          </Col>
          <Col span={14} className='border p-4'>
            {inputs.map((input, index) => (
              <Flex gap='small' key={index}>
                <Form.Item name={'doc-' + index} label='Jenis Dokumen' labelCol={{ span: 10 }} wrapperCol={{ span: 200 }} rules={[{ required: true }]}>
                  <Input
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    placeholder='(Contoh: IMB, PBB, dll)'
                  />
                </Form.Item>
                <Button icon={<DeleteOutlined />} ghost danger shape="circle" onClick={() => handleDeleteInput(index)} className='border-0'></Button>
                <Form.Item name={input}>
                  <Upload
                    onRemove={(file) => {
                      setFileList(
                        fileList.map(
                          (v, i) => {
                            if (i == index) {
                              return v.filter(
                                (k, j) => file.uid !== k.uid && file.name !== k.name
                              )
                            }
                            return v
                          }
                        )
                      )
                    }}
                    beforeUpload={(file) => {
                      setFileList(
                        fileList.map(
                          (v, i) => {
                            if (i == index) {
                              return [...v, file]
                            } return v
                          }
                        )
                      )
                      return false
                    }}
                  >
                    <Button icon={<UploadOutlined />}>Upload</Button>
                  </Upload>
                </Form.Item>
              </Flex>
            ))}
            <Button type="primary" onClick={handleAddInput}>
              Tambah Dokumen
            </Button>
          </Col>
        </Row>
        <div className="flex justify-end gap-2 pt-4">
          <Form.Item>
            <Button onClick={() => {
              props.setOpenModal(false)
              form.resetFields()
              setInputs([])
              setFileList([])

            }}>Cancel</Button>
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" type="primary" loading={uploading}> {uploading ? 'Uploading' : 'Submit'}</Button>
          </Form.Item>
        </div>
      </Form>
      <Upload>
        <Button>Coba</Button>
      </Upload>
    </Modal>
  )
}
