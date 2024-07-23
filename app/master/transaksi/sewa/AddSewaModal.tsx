import { Button, Form, Input, Modal, Select, Typography, message, UploadProps, GetProp, DatePicker, Row, Col, Radio, FormInstance, Upload, UploadFile, Image, Table, Popconfirm } from 'antd'
const { Option } = Select;
import React, { useEffect, useState } from 'react'
import { DataAset, DataCabang, DataPelanggan } from '@/app/types/master'
import dayjs, { Dayjs } from 'dayjs';
const { Text } = Typography;
const { RangePicker } = DatePicker;
import type { RadioChangeEvent } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { list } from 'postcss';
import { _renderCurrency } from '@/app/utils/renderCurrency';
import { CurrencyInput } from '@/app/components/currencyInput/currencyInput';
import isBetween from 'dayjs/plugin/isBetween'

dayjs.extend(isBetween);
type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0]

interface Status {
  openModal: boolean,
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>,
  triggerRefresh: boolean,
  setTriggerRefresh: React.Dispatch<React.SetStateAction<boolean>>
  form: FormInstance,
  isEdit: boolean,
  maxId: number,
  sewaData: any[],
}

interface DiffPeriod { tahun: number, bulan: number }

export default function AddSewaModal(props: Status) {
  const [allData, setAllData] = useState<{ cabang: any, pelanggan: any, aset: any }>({ cabang: [], pelanggan: [], aset: [] })
  const [diffPeriod, setDiffPeriod] = useState<DiffPeriod>({ tahun: 0, bulan: 0 })
  const [currencyValue, setCurrencyValue] = useState<number>(0)
  const [iplValue, setIplValue] = useState<number>(0)
  const [periodePembayaran, setPeriodePembayaran] = useState<string>('Pertahun');
  const [selectedCabang, setSelectedCabang] = useState<number | undefined>(undefined)
  const [selectedAset, setSelectedAset] = useState<number | undefined>(undefined)
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [listFiles, setListFiles] = useState([])
  const [uploading, setUploading] = useState(false);
  const dateFormat = 'DD-MM-YYYY'

  const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  function hitungHarga(diffPeriod: DiffPeriod, currencyValue: number, periodePembayaran: string): number {
    const totalBulan = (diffPeriod.tahun * 12) + diffPeriod.bulan
    return (periodePembayaran == 'Perbulan') ? currencyValue * totalBulan : currencyValue * totalBulan / 12
  }

  const handleDateChange = (dates: [Dayjs | null, Dayjs | null], dateStrings: [string, string], dFormat: string = dateFormat) => {
    if (dates && dates[0] && dates[1]) {
      const totalMonths = dayjs(dateStrings[1], dFormat).diff(dayjs(dateStrings[0], dFormat).subtract(1, 'day'), 'month');
      const years = Math.floor(totalMonths / 12);
      let months = totalMonths % 12;
      const endOfMonthPeriod = dayjs(dateStrings[0], dFormat).add(months, 'month').add(years, 'years');

      let days = dayjs(dateStrings[1], dFormat).diff(endOfMonthPeriod.subtract(1, 'day'), 'day');
      if (days > 1) {
        months += 1;
        days = 0;
      }
      setDiffPeriod({ tahun: years, bulan: months });
    }
  };

  async function addSewa(value: any) {
    value.start_date_sewa = value.masa_sewa[0].format(dateFormat).toString()
    value.end_date_sewa = value.masa_sewa[1].format(dateFormat).toString()
    value.tanggal_akte = value.tanggal_akte.format(dateFormat).toString()
    value.total_biaya_sewa = hitungHarga(diffPeriod, currencyValue, periodePembayaran)
    const requestType = (props.isEdit) ? 'edit' : 'add'
    const result = await fetch('/api/master/transaksi/sewa', {
      method: 'POST', body:
        JSON.stringify({
          requestType: requestType,
          data: value,
        })
      ,
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((res) => {
      return res.json()
    })
      .then((res) => {
        if (res) {
          fileList.forEach(
            (v: UploadFile, idx: number) => {
              const formData = new FormData()
              formData.append('id_transaksi', value.id_transaksi)
              formData.append('files[]', v as FileType)

              fetch('/api/master/transaksi/upload', { method: 'POST', body: formData })
                .then((res) => res.json())
                .then((res) => {
                  if (res.status == 200) {
                    message.success("upload success")
                  } else {
                    message.error("upload failed")
                  }
                })
                .catch(() => message.error("upload failed"))
            }
          )
        }
        if (res.status == 200) {
          message.success("Tambah/Edit sewa aset berhasil")
        } else {
          message.error("Tambah/Edit sewa aset gagal")
        }
      })
      .catch(() => message.error("Tambah/Edit sewa aset gagal"))
      .finally(() => {
        props.setOpenModal(false)
        setUploading(false)
      })
    props.setOpenModal(false)
    props.setTriggerRefresh(!props.triggerRefresh)
    props.form.resetFields()
    setListFiles([])
    setFileList([])
  }

  async function getAllData() {
    const allCabang = await fetch('/api/master/cabang', { method: 'GET', cache: 'no-store' })
    const allPelanggan = await fetch('/api/master/pelanggan', { method: 'GET', cache: 'no-store' })
    const allAset = await fetch('/api/master/aset', { method: 'GET', cache: 'no-store' })
    const dataCabang = (await allCabang.json()).data.map((value: DataCabang) => {
      return { id: value.id, nama_perusahaan: value.nama_perusahaan }
    })
    const dataPelanggan = (await allPelanggan.json()).data.map((value: DataPelanggan) => { return { id: value.id, nama: value.nama } })
    const dataAset = (await allAset.json()).data.map((value: DataAset) => { return { id: value.id, nama_aset: value.nama_aset, id_cabang: value.id_cabang } })
    if (dataCabang || dataPelanggan || dataAset) {
      setAllData({
        cabang: dataCabang,
        pelanggan: dataPelanggan,
        aset: dataAset
      })
    }
    if (props.isEdit && props.openModal) {
      const masa_sewa = props.form.getFieldValue("masa_sewa")
      handleDateChange(masa_sewa, [masa_sewa[0].format(dateFormat).toString(), masa_sewa[1].format(dateFormat).toString()])
      setCurrencyValue(props.form.getFieldValue("harga"))
      setPeriodePembayaran(props.form.getFieldValue("periode_pembayaran"))
      setSelectedCabang(props.form.getFieldValue("id_cabang"))
      setListFiles(props.form.getFieldValue('list_files'))
    }
  }

  useEffect(
    () => {
      getAllData()
    }, [props.triggerRefresh]
  )

  return (
    <Modal open={props.openModal} footer={null} width={800} title='Form Transaksi Sewa' closeIcon={null}>
      <Form layout='horizontal' form={props.form}
        fields={(props.isEdit) ? [] : [{
          "name": ["id_transaksi"],
          "value": 'TXS-' + props.maxId.toString().padStart(4, "0")
        }]}
        onFinish={addSewa}
        labelAlign='left'
        labelCol={{ span: 7 }}
        labelWrap
        wrapperCol={{ span: 15 }}
      >
        <Row>
          <Form.Item name='id_transaksi' />
          <Col span={24}>
            <Form.Item name='id' label="id" hidden >
              <Input placeholder='id' autoComplete='off' hidden />
            </Form.Item>
            <Form.Item name='id_cabang' required label="Nama Cabang" rules={[{ required: true }]}>
              <Select placeholder="Cabang" allowClear onChange={(value) => setSelectedCabang(value) }>
                {allData.cabang.map(
                  (value: any) => <Option key={value.id} value={value.id}>{value.nama_perusahaan}</Option>
                )}
              </Select>
            </Form.Item>
            <Form.Item name='id_aset' required label="Nama Aset" rules={[{ required: true }]}>
              <Select placeholder="Aset" allowClear disabled={!selectedCabang} onChange={
                (value) => {
                  setSelectedAset(value)
                }
              }>
                {allData.aset.filter((item: any) => item.id_cabang == selectedCabang).map(
                  (value: any) => <Option key={value.id} value={value.id}>{value.nama_aset}</Option>
                )}
              </Select>
            </Form.Item>
            <Form.Item name='id_pelanggan' required label="Nama Pelanggan" rules={[{ required: true }]}>
              <Select placeholder="Pelanggan" allowClear>
                {allData.pelanggan.map(
                  (value: any) => <Option key={value.id} value={value.id}>{value.nama}</Option>
                )}
              </Select>
            </Form.Item>
            <Form.Item name='no_akte' required label="Nomor Akte" rules={[{ required: true }]}>
              <Input placeholder='Nomor Akte' autoComplete='off' />
            </Form.Item>
            <Form.Item
              name='tanggal_akte' required label='Tanggal Akte' rules={[{ required: true }]}>
              <DatePicker value={(props.isEdit) ? dayjs(props.form.getFieldValue("tanggal_akte"), dateFormat) : null} allowClear={false} format={dateFormat}
              ></DatePicker>
            </Form.Item>
            <Form.Item name='notaris' required label="Notaris" rules={[{ required: true }]}>
              <Input placeholder='Notaris' autoComplete='off' />
            </Form.Item>
            <Form.Item
              name='masa_sewa' required label="Masa Sewa" rules={[{ required: true }]}>
              <RangePicker allowClear={false} onChange={(dates, dateStrings) => {
                const dFormat = dateFormat
                if (dates && dates[0] && dates[1]) {
                  const totalMonths = dayjs(dateStrings[1], dFormat).diff(dayjs(dateStrings[0], dFormat).subtract(1, 'day'), 'month');
                  const years = Math.floor(totalMonths / 12);
                  let months = totalMonths % 12;
                  const endOfMonthPeriod = dayjs(dateStrings[0], dFormat).add(months, 'month').add(years, 'years');

                  let days = dayjs(dateStrings[1], dFormat).diff(endOfMonthPeriod.subtract(1, 'day'), 'day');
                  if (days > 1) {
                    months += 1;
                    days = 0;
                  }
                  setDiffPeriod({ tahun: years, bulan: months });
                }
              }} format={dateFormat} 
              disabledDate={(current) => {
                try {
                  return props.sewaData.filter(i => i.id_aset == selectedAset && i.id_cabang == selectedCabang).some(
                    range => current.isBetween(dayjs(range.start_date_sewa, dateFormat), dayjs(range.end_date_sewa, dateFormat), null, '[]')
                  )
                } catch (e) { return false}
              }}
              />
            </Form.Item>
            <Form.Item name='periode_pembayaran' required label="Periode Pembayaran" initialValue={props.form.getFieldValue('periode_pembayaran') ? 'Pertahun' : 'Pertahun'}>
              <Radio.Group value={periodePembayaran} onChange={(e: RadioChangeEvent) => {
                setPeriodePembayaran(e.target.value);
              }}>
                <Radio.Button value="Pertahun">Pertahun</Radio.Button>
                <Radio.Button value="Perbulan">Perbulan</Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Form.Item name='harga' required label="Harga Sewa" rules={[
              { required: true },
            ]}>
              <CurrencyInput value={currencyValue} onChange={(value) => setCurrencyValue(() => value)} />
            </Form.Item>
            <Form.Item name='ipl' required label="Iuran IPL" rules={[
              { required: true },
            ]}>
              <CurrencyInput value={iplValue} onChange={(value) => setIplValue(() => value)} />
            </Form.Item>
            <Form.Item name='file' label="Upload Dokumen" required={!props.isEdit} rules={[{ required: !props.isEdit }]}>
              <Upload
                multiple
                onPreview={handlePreview}
                listType='picture-card'
                beforeUpload={(file) => {
                  setFileList([...fileList, file])
                }}
                onRemove={(file) => {
                  setFileList(
                    fileList.filter(v => file.uid != v.uid)
                  )
                }}
              >
                <button style={{ border: 0, background: 'none' }} type="button">
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </button>
              </Upload>
            </Form.Item>
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
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <Row>
              <Text className='pl-2'>Periode Sewa: {diffPeriod.tahun ? diffPeriod.tahun : '0'} Tahun {diffPeriod.bulan ? diffPeriod.bulan : '0'} Bulan</Text>
            </Row>
            <Row>
              <Text className='pl-2'>Periode Pembayaran: {periodePembayaran}</Text>
            </Row>
            <Row>
              <Text className='pl-2'>Biaya Sewa: {(currencyValue != 0) ? _renderCurrency(hitungHarga(diffPeriod, currencyValue, periodePembayaran)) : 'Rp 0'} </Text>
            </Row>
          </Col>
          <Col span={14}>
            <Table size='small'
              dataSource={listFiles}
              pagination={{ pageSize: 2 }}
              columns={[
                {
                  title: "Dokument",
                  render: (_, record) => (
                    <a href={`/upload/txs/${props.form.getFieldValue("id_transaksi")}/${record}`} target="_blank" rel="noopener noreferrer">{record}</a>
                  )
                },
                {
                  title: "Action",
                  render: (_, record) => (
                    <Popconfirm
                      title="sure to delete?"
                      onConfirm={
                        async function deleteCabang() {
                          const requstType = 'delete-one-file'
                          const result = await fetch('/api/master/transaksi/sewa', {
                            method: "POST",
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              requestType: requstType,
                              data: { file: record, id_transaksi: props.form.getFieldValue("id_transaksi") }
                            })
                          })
                          if (result.status == 200) {
                            // setTriggerRefresh(!triggerRefresh)
                          }
                          setListFiles(listFiles.filter(v => v != record))
                        }
                      }
                    >
                      <Button size="small" danger>
                        Delete
                      </Button>
                    </Popconfirm>
                  )
                }
              ]}
            ></Table>
          </Col>
        </Row>
        <div className="flex justify-end gap-2">
          <Form.Item>
            <Button onClick={() => {
              props.setOpenModal(false);
              props.form.resetFields();
              setDiffPeriod({ tahun: 0, bulan: 0 });
              setCurrencyValue(0)
              setPeriodePembayaran('Pertahun')
              setFileList([])
              setListFiles([])
            }}>Cancel</Button>
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" type="primary" loading={uploading}>{(uploading) ? 'Uploading' : 'Submit'}</Button>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  )
}
