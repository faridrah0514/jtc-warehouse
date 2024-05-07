import { Button, FormInstance, Form, Input, Modal, Select, UploadFile, Upload, message, UploadProps, GetProp, Col, Row, Flex, DatePicker, Image, Divider } from 'antd'
const { Option } = Select;
import TextArea from 'antd/es/input/TextArea'
import React, { useEffect, useRef, useState } from 'react'
import { DataAset, DataCabang } from '@/app/types/master'
import { DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0]

interface Status {
  openModal: boolean,
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>,
  triggerRefresh: boolean,
  setTriggerRefresh: React.Dispatch<React.SetStateAction<boolean>>,
  form: FormInstance<DataAset>,
  setIsEdit: React.Dispatch<React.SetStateAction<boolean>>,
  setIsAddDocument: React.Dispatch<React.SetStateAction<boolean>>
  isEdit: boolean,
  isAddDocument: boolean,
  maxId: number
}

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export default function AddAssetModal(props: Status) {
  const [form] = Form.useForm<DataAset>()
  const [tipeAsetForm] = Form.useForm<any>()
  const [tipeSertifikatForm] = Form.useForm<any>()
  const [allCabang, setAllCabang] = useState<{ id: number, nama_perusahaan: string }[]>([])
  const [fileList, setFileList] = useState<UploadFile[][]>([]);
  const [uploading, setUploading] = useState(false);
  const [inputs, setInputs] = useState<string[]>([]);
  const [tipeAsetModal, setTipeAsetModal] = useState<boolean>(false);
  const [tipeSertifikatModal, setTipeSertifikatModal] = useState<boolean>(false);
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(true)
  const [tipeAset, setTipeAset] = useState<{ id: number, tipe_aset: string }[]>([])
  const [tipeSertifikat, setTipeSertifikat] = useState<{ id: number, tipe_sertifikat: string }[]>([])

  useEffect(
    () => {
      async function getAllCabang() {

        const response = await fetch('/api/master/cabang', { method: 'GET' })
        const tipeAsetResp = await (await fetch('/api/master/aset/tipe_aset', { method: 'GET' })).json()
        const tipeSertifikatResp = await (await fetch('/api/master/aset/tipe_sertifikat', { method: 'GET' })).json()
        const dataCabang = (await response.json()).data.map((value: DataCabang) => {
          return { id: value.id, nama_perusahaan: value.nama_perusahaan }
        })

        if (dataCabang) {
          setAllCabang(dataCabang)
        }
        if (tipeAsetResp) {
          setTipeAset(tipeAsetResp.data)
        }
        if (tipeSertifikatResp) {
          setTipeSertifikat(tipeSertifikatResp.data)
        }
      }
      getAllCabang()
    }, [triggerRefresh]
  )

  async function addTipeAset(value: any) {
    const result = await fetch('/api/master/aset/tipe_aset', {
      method: 'POST', body: JSON.stringify({
        requestType: 'add',
        data: value
      }), headers: {
        'Content-Type': 'application/json',
      },
    })
    setTipeAsetModal(false)
    setTriggerRefresh(!triggerRefresh)
    tipeAsetForm.resetFields()
  }

  async function addTipeSertifikat(value: any) {
    const result = await fetch('/api/master/aset/tipe_sertifikat', {
      method: 'POST', body: JSON.stringify({
        requestType: 'add',
        data: value
      }), headers: {
        'Content-Type': 'application/json',
      },
    })
    setTipeSertifikatModal(false)
    setTriggerRefresh(!triggerRefresh)
    tipeSertifikatForm.resetFields()
  }

  async function addAset(value: any) {
    //Insert Data to Database
    value.doc_list = [...inputs]
    if (props.isEdit || props.isAddDocument) {
      // const str = "CB-0016-AS-0108";
      const desiredString = value.id_aset.slice(value.id_aset.indexOf("AS"));
      value.id_aset = 'CB-' + value.id_cabang.toString().padStart(4, "0") + '-' + desiredString
      const requestType = props.isEdit ? 'edit' : ''
      const result = await fetch('/api/master/aset/add', {
        method: 'POST', body: JSON.stringify({
          requestType: requestType,
          data: value
        }), headers: {
          'Content-Type': 'application/json',
        },
      })
    } else {
      value.id_aset = 'CB-' + value.id_cabang.toString().padStart(4, "0") + '-' + value.id_aset
      const result = await fetch('/api/master/aset/add', {
        method: 'POST', body: JSON.stringify({
          requestType: 'add',
          data: value
        }), headers: {
          'Content-Type': 'application/json',
        },
      })
    }

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
    props.form.resetFields()
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


  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  return (
    <>
      {/* Modal Tambah Tipe Aset */}
      <Modal open={tipeAsetModal} closeIcon={null} footer={null} title='Form Tambah Tipe Aset'>
        <Form name="addTipeAsetForm" form={tipeAsetForm} onFinish={addTipeAset}>
          <Form.Item name='tipe_aset' label="Tipe Aset">
            <Input placeholder='Masukkan Tipe Aset' autoComplete='off'/>
          </Form.Item>
          <div className="flex justify-end gap-2 pt-4">
            <Form.Item>
              <Button onClick={() => {
                tipeAsetForm.resetFields()
                setTipeAsetModal(false)
              }}>Cancel</Button>
            </Form.Item>
            <Form.Item>
              <Button htmlType="submit" type="primary" loading={uploading} > {uploading ? 'Uploading' : 'Submit'}</Button>
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Modal Tambah Tipe Sertifikat */}
      <Modal open={tipeSertifikatModal} closeIcon={null} footer={null} title='Form Tambah Tipe Sertifikat'>
        <Form name="addTipeSertifikatForm" form={tipeSertifikatForm} onFinish={addTipeSertifikat}>
          <Form.Item name='tipe_sertifikat' label="Tipe Sertifikat">
            <Input placeholder='Masukkan Tipe Sertifikat' autoComplete='off' />
          </Form.Item>
          <div className="flex justify-end gap-2 pt-4">
            <Form.Item>
              <Button onClick={() => {
                tipeSertifikatForm.resetFields()
                setTipeSertifikatModal(false)
              }}>Cancel</Button>
            </Form.Item>
            <Form.Item>
              <Button htmlType="submit" type="primary" loading={uploading} > {uploading ? 'Uploading' : 'Submit'}</Button>
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Modal Utama Form Tambah Aset */}
      <Modal open={props.openModal} footer={null} title='Form Tambah Aset' closeIcon={null} width={props.isEdit || props.isAddDocument ? 1000 : 2000}>
        <Form
          autoComplete='off'
          fields={(props.isEdit || props.isAddDocument) ? [] : [{
            "name": ["id_aset"],
            "value": 'AS-' + props.maxId.toString().padStart(4, "0")
          }]}
          form={props.form} layout='horizontal' labelAlign='left' labelCol={{ span: 7 }} labelWrap wrapperCol={{ span: 15 }} onFinish={addAset} name="parent_form">
          <Row gutter={20}>
            {(props.isEdit || props.isAddDocument) &&
              <>
                <Form.Item name='id' required label="id" rules={[{ required: true }]} hidden>
                  <Input hidden placeholder='id' autoComplete='off' />
                </Form.Item>
                <Form.Item name='id_aset' />
                <Form.Item name='id_cabang' />
              </>
            }

            {(
              () => {
                if (!props.isAddDocument) {
                  return (
                    <Col span={props.isEdit ? 24 : 13} className='border p-4' hidden>
                      <Row>
                        <Col span={12}>
                          <Form.Item name='id_tipe_aset' required label="Tipe Aset" rules={[{ required: true }]}>
                            <Select placeholder='Tipe Aset' allowClear dropdownRender={(menu) => {
                              return (
                                <>
                                  {menu}
                                  <Divider style={{ margin: '0' }} />
                                  <Button style={{ paddingLeft: '10px' }} type="link" onClick={() => { setTipeAsetModal(true) }}>
                                    Tambah Tipe Aset
                                  </Button>
                                </>
                              )
                            }}
                              options={
                                tipeAset.map((v, idx) => { return { label: v.tipe_aset, value: v.id } })
                              }
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name='id_aset'>
                            {/* <Input disabled /> */}
                          </Form.Item>
                        </Col>

                      </Row>
                      <Row>
                        <Col span={12}>
                          <Form.Item name='nama_aset' required label="Nama Aset" rules={[{ required: true }]} >
                            <Input placeholder='Nama Asset' autoComplete='off' />
                          </Form.Item>
                        </Col>

                      </Row>
                      <Row>
                        <Col span={12}>
                          <Form.Item name='alamat' required label='Alamat' rules={[{ required: true }]} >
                            <TextArea rows={3} placeholder='Alamat' autoComplete='new-password' />
                          </Form.Item>
                        </Col>

                      </Row>
                      <Row>
                        <Col span={12}>
                          <Form.Item name='kota' required label='Kota' rules={[{ required: true }]} >
                            <Input placeholder='Kota' autoComplete='off' />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name='id_cabang' required label="Cabang" rules={[{ required: true }]}>
                            <Select placeholder="Cabang" allowClear>
                              {allCabang.map(
                                (value) => <Option key={value.id} value={value.id}>{value.nama_perusahaan}</Option>
                              )}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row>
                        <Col span={12}>
                          <Form.Item name='no_tlp' required label='No. Tlp' rules={[{ required: true }]}>
                            <Input placeholder='No. Tlp' autoComplete='off' />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name='no_rek_air' required label='No. Rek. Air' rules={[{ required: true }]}>
                            <Input placeholder='No. Rek. Air' autoComplete='off' />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row>
                        <Col span={12}>
                          <Form.Item name='no_rek_listrik' required label='No. Rek. Listrik' rules={[{ required: true }]}>
                            <Input placeholder='No. Rek. Listrik' autoComplete='off' />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name='no_pbb' required label='No. PBB' rules={[{ required: true }]}>
                            <Input placeholder='No. PBB' autoComplete='off' />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row>
                        <Col span={12}>
                          <Form.Item name='id_tipe_sertifikat' required label="Tipe Sertifikat" rules={[{ required: true }]}>
                            <Select placeholder='Tipe Sertifikat' allowClear dropdownRender={(menu) => {
                              return (
                                <>
                                  {menu}
                                  <Divider style={{ margin: '0' }} />
                                  <Button style={{ paddingLeft: '10px' }} type="link" onClick={() => { setTipeSertifikatModal(true) }}>
                                    Tambah Tipe Sertifikat
                                  </Button>
                                </>
                              )
                            }}
                              options={
                                tipeSertifikat.map((v, idx) => { return { label: v.tipe_sertifikat, value: v.id } })
                              }
                            />

                          </Form.Item>
                        </Col>

                        <Col span={12}>
                          <Form.Item name='no_sertifikat' required label="No. Sertifikat" rules={[{ required: true }]}>
                            <Input placeholder='No. Sertifikat' autoComplete='off' />
                          </Form.Item>
                        </Col>

                      </Row>
                      <Row>
                        <Col span={12}>
                          {/* <Form.Item name='tanggal_akhir_hgb' required label='Tgl. Akhir HGB' rules={[{ required: true }]} labelCol={{ span: 7 }} wrapperCol={{ span: 15 }}>
                  <DatePicker allowClear={false}></DatePicker>
                </Form.Item> */}
                        </Col>
                        <Col span={12}>
                          <Form.Item name='status' required label='Status' rules={[{ required: true }]}>
                            <Select placeholder='Status' allowClear>
                              <Option value='Aktif'>Aktif</Option>
                              <Option value='Tidak-Aktif'>Tidak Aktif</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                    </Col>
                  )
                }
              }
            )()}

            {(
              () => {
                if (!props.isEdit)
                  return (
                    <Col span={props.isAddDocument ? 24 : 11} className='border p-4'>
                      {inputs.map((input, index) => (
                        <Row key={index} gutter={10}>
                          <Col span={10}>
                            <Flex gap="small">
                              <Form.Item name={'doc-' + index} label='Jenis Dokumen' labelCol={{ span: 12 }} wrapperCol={{ span: 200 }} rules={[{ required: true }]}>
                                <Input
                                  onChange={(e) => handleInputChange(index, e.target.value)}
                                  placeholder='(Contoh: IMB, PBB, dll)'
                                  autoComplete='off'
                                />
                              </Form.Item>
                              <Button icon={<DeleteOutlined />} ghost danger shape="circle" onClick={() => handleDeleteInput(index)} className='border-0'></Button>
                            </Flex>

                          </Col>
                          <Col span={14}>
                            <Form.Item name={input}>
                              <Upload
                                onPreview={handlePreview}
                                // onChange={handleAddInput}
                                listType='picture-card'
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
                                <button style={{ border: 0, background: 'none' }} type="button">
                                  <PlusOutlined />
                                  <div style={{ marginTop: 8 }}>Upload</div>
                                </button>
                              </Upload>
                            </Form.Item>
                          </Col>
                          {previewImage &&
                            <Image
                              wrapperStyle={{ display: 'none' }}
                              preview={{
                                visible: previewOpen,
                                onVisibleChange: (visible) => setPreviewOpen(visible),
                                afterOpenChange: (visible) => !visible && setPreviewImage(''),
                              }}
                              src={previewImage}
                            />
                          }
                        </Row>

                      ))}
                      <Button type="primary" onClick={handleAddInput}>
                        Tambah Dokumen
                      </Button>
                    </Col>
                  )
              }
            )()}

          </Row>
          <div className="flex justify-end gap-2 pt-4">
            <Form.Item>
              <Button onClick={() => {
                props.setOpenModal(false)
                props.form.resetFields()
                props.setIsEdit(false)
                props.setIsAddDocument(false)
                setInputs([])
                setFileList([])
              }}>Cancel</Button>
            </Form.Item>
            <Form.Item>
              <Button htmlType="submit" type="primary" loading={uploading}> {uploading ? 'Uploading' : 'Submit'}</Button>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </>

  )
}
