import { Button, Form, Input, Modal, Select, Typography, message, UploadProps, GetProp, DatePicker, Row, Col, Radio, FormInstance, Upload, UploadFile, Image } from 'antd'
const { Option } = Select;
import React, { useEffect, useRef, useState, ChangeEvent } from 'react'
import { DataAset, DataCabang, DataPelanggan } from '@/app/types/master'
import dayjs, { Dayjs } from 'dayjs';
const { Text, Link } = Typography;
const { RangePicker } = DatePicker;
import type { RadioChangeEvent } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0]

interface Status {
  openModal: boolean,
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>,
  triggerRefresh: boolean,
  setTriggerRefresh: React.Dispatch<React.SetStateAction<boolean>>
  form: FormInstance,
  isEdit: boolean,
  maxId: number
}

export const _renderCurrency = (value: number) => {
  let number = Number(value)
  return number?.toLocaleString('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  })
}

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  allowNegative?: boolean;
  [key: string]: any; // for other props
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value = 0,
  onChange,
  className = '',
  allowNegative = true,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let rawText = e.target.value
    let numberText = rawText.replace(/\D/g, '')
    let result = numberText
    onChange(Number(result))
  }

  return (
    <Input
      className={`${className}`}
      value={`${_renderCurrency(value)}`}
      onChange={handleChange}
      onClick={() => inputRef?.current?.click}
      onFocus={() => inputRef?.current?.focus}
      {...props}
    />
  )
}

interface DiffPeriod { tahun: number, bulan: number }

export default function AddSewaModal(props: Status) {
  const [allData, setAllData] = useState<{ cabang: any, pelanggan: any, aset: any }>({ cabang: [], pelanggan: [], aset: [] })
  const [diffPeriod, setDiffPeriod] = useState<DiffPeriod>({ tahun: 0, bulan: 0 })
  const [uploading, setUploading] = useState(false);
  const [currencyValue, setCurrencyValue] = useState<number>(0)
  const [periodePembayaran, setPeriodePembayaran] = useState<string>('Perbulan');
  const [selectedCabang, setSelectedCabang] = useState<number | undefined>(undefined)
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const dateFormat = 'DD-MM-YYYY'
  // const [triggerRefresh, setTriggerRefresh] = useState<boolean>(true)

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
  // console.log("props.form: ", props.form.getFieldsValue())



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

  // if (props.form.getFieldValue("id")) {
  //   console.log("edit niii")
  //   const rentPeriod = props.form.getFieldValue("masa_sewa")
  //   const rentPeriodString: [string,string] = [rentPeriod[0].format(dateFormat).toString(), rentPeriod[1].format(dateFormat).toString()]
  //   console.log(rentPeriod)
  //   console.log("rentPeriosString: ", rentPeriodString)
  //   // console.log("rentPeriod[0].format(dateFormat).toString(): ", [rentPeriod[0].format(dateFormat).toString(), rentPeriod[1].format(dateFormat).toString()])
  //   handleDateChange(_, rentPeriodString)
  // }

  useEffect(
    () => {
      async function getAllData() {
        const allCabang = await fetch('/api/master/cabang', { method: 'GET', cache: 'no-store' })
        const allPelanggan = await fetch('/api/master/pelanggan', { method: 'GET', cache: 'no-store' })
        const allAset = await fetch('/api/master/aset', { method: 'GET', cache: 'no-store' })
        const dataCabang = (await allCabang.json()).data.map((value: DataCabang) => {
          return { id: value.id, nama_perusahaan: value.nama_perusahaan }
        })
        // console.log("allAset: ", (await allAset.json()).data)
        const dataPelanggan = (await allPelanggan.json()).data.map((value: DataPelanggan) => { return { id: value.id, nama: value.nama } })
        const dataAset = (await allAset.json()).data.map((value: DataAset) => { return { id: value.id, nama_aset: value.nama_aset, id_cabang: value.id_cabang } })
        if (dataCabang || dataPelanggan || dataAset) {
          setAllData({
            cabang: dataCabang,
            pelanggan: dataPelanggan,
            aset: dataAset
          })
          // console.log("allData: ", {
          //   cabang: dataCabang,
          //   pelanggan: dataPelanggan,
          //   aset: dataAset
          // })
        }
        // if (props.form.getFieldValue("id")) {
        //   console.log("edit niii")
        //   const rentPeriod = props.form.getFieldValue("masa_sewa")
        //   const rentPeriodString: [string,string] = [rentPeriod[0].format(dateFormat).toString(), rentPeriod[1].format(dateFormat).toString()]
        //   console.log(rentPeriod)
        //   console.log("rentPeriosString: ", rentPeriodString)
        //   // console.log("rentPeriod[0].format(dateFormat).toString(): ", [rentPeriod[0].format(dateFormat).toString(), rentPeriod[1].format(dateFormat).toString()])
        //   handleDateChange(rentPeriod, rentPeriodString)
        // }
      }
      getAllData()
    }, []
  )

  return (
    <Modal open={props.openModal} footer={null} width={800} title='Form Transaksi Sewa' closeIcon={null}>
      <Form layout='horizontal' form={props.form}
        fields={(props.isEdit) ? [] : [{
          "name": ["id_transaksi"],
          "value": 'TXS-' + props.maxId.toString().padStart(4, "0")
        }]}
        onFinish={
          async function addSewa(value) {
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
            })
            fileList.forEach(
              (v: UploadFile, idx: number) => {
                // console.log("v, idx: ", v, idx)
                const formData = new FormData()
                formData.append('id_transaksi', value.id_transaksi)
                formData.append('files[]', v as FileType)

                fetch('/api/master/transaksi/upload',{ method: 'POST', body: formData })
                .then((res) => res.json())
                .then((res) => {
                  if (res.status == 200) {
                    message.success("upload success")
                  } else {
                    message.error("upload failed")
                  }
                })
                .catch(() => message.error("upload failed"))
                // fd.push(formData)
                // formData.append('nama_aset', value.nama_aset)
                // formData.append('id_aset', value.id_aset)
                // formData.append('doc_list', input)
                // fileList[idx].forEach(
                //   (file) => {
                //     formData.append('files[]', file as FileType)
                //   }
                // )
                // setUploading(true)
                // fetch('/api/master/aset/upload', {
                //   method: 'POST',
                //   body: formData
                // }).then((res) => res.json())
                //   .then((res) => {
                //     setFileList([])
                //     if (res.status == 200) {
                //       message.success("upload success")
                //     } else {
                //       message.error("upload failed")
                //     }

                //   })
                //   .catch(() => message.error("upload failed"))
                //   .finally(() => setUploading(false))
              }
            )

            // formData.append('satu', 'satu')

      
            props.setOpenModal(false)
            props.setTriggerRefresh(!props.triggerRefresh)
            // if (formRef.current) formRef.current.resetFields();
            props.form.resetFields()
            // props.isEdit = false
          }
        }
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
            <Form.Item name='no_akte' required label="Nomor Akte" rules={[{ required: true }]}>
              <Input placeholder='Nomor Akte' autoComplete='off' />
            </Form.Item>
            <Form.Item
              name='tanggal_akte' required label='Tanggal Akte' rules={[{ required: true }]}>
              <DatePicker value={(props.isEdit) ? dayjs(props.form.getFieldValue("tanggal_akte")) : null} allowClear={false} format={dateFormat}
              ></DatePicker>
            </Form.Item>
            <Form.Item name='notaris' required label="Notaris" rules={[{ required: true }]}>
              <Input placeholder='Notaris' autoComplete='off' />
            </Form.Item>
            <Form.Item name='id_pelanggan' required label="Nama Pelanggan" rules={[{ required: true }]}>
              <Select placeholder="Pelanggan" allowClear>
                {allData.pelanggan.map(
                  (value: any) => <Option key={value.id} value={value.id}>{value.nama}</Option>
                )}
              </Select>
            </Form.Item>
            <Form.Item name='id_cabang' required label="Nama Cabang" rules={[{ required: true }]}>
              <Select placeholder="Cabang" allowClear onChange={(value) => { setSelectedCabang(value) }}>
                {allData.cabang.map(
                  (value: any) => <Option key={value.id} value={value.id}>{value.nama_perusahaan}</Option>
                )}
              </Select>
            </Form.Item>
            <Form.Item name='id_aset' required label="Nama Aset" rules={[{ required: true }]}>
              <Select placeholder="Aset" allowClear disabled={!selectedCabang}>
                {allData.aset.filter((item: any) => item.id_cabang == selectedCabang).map(
                  (value: any) => <Option key={value.id} value={value.id}>{value.nama_aset}</Option>
                )}
              </Select>
            </Form.Item>
            <Form.Item
              name='masa_sewa' required label="Masa Sewa" rules={[{ required: true }]}>
              <RangePicker allowClear={false} onChange={
                handleDateChange


                //   (a, b) => {
                //     console.log("b: ", b)
                //     console.log("b[0]: ", dayjs(b[0], 'DD-MM-YYYY'))
                //     // console.log("a: ", a)
                //   const totalMonths = dayjs(b[1], dateFormat).diff(dayjs(b[0], dateFormat).subtract(1, 'day'), 'month')
                //   const years = Math.floor(totalMonths / 12);
                //   let months = totalMonths % 12;
                //   const endOfMonthPeriod = dayjs(b[0], dateFormat).add(months, 'month').add(years, 'years')

                //   let days = dayjs(b[1], dateFormat).diff(endOfMonthPeriod.subtract(1, 'day'), 'day')
                //   if (days > 1) {
                //     months = months + 1
                //     days = 0
                //   }
                //   setDiffPeriod({ tahun: years, bulan: months })

                // }

              }
                format={dateFormat}
              />
            </Form.Item>
            <Form.Item name='periode_pembayaran' required label="Periode Pembayaran" initialValue={props.form.getFieldValue('periode_pembayaran') ?? 'Perbulan'}>
              <Radio.Group value={periodePembayaran} onChange={(e: RadioChangeEvent) => {
                setPeriodePembayaran(e.target.value);
              }}>
                <Radio.Button value="Pertahun" disabled={diffPeriod.tahun < 1 ? true : false}> Pertahun</Radio.Button>
                <Radio.Button value="Perbulan">Perbulan</Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Form.Item name='harga' required label="Harga Sewa" rules={[
              { required: true },
            ]}>
              <CurrencyInput value={currencyValue} onChange={(value) => setCurrencyValue(() => value)} />
            </Form.Item>
            <Form.Item name='file' label="Upload Dokumen" required rules={[{ required: true }]}>
              <Upload
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
          {(!props.isEdit) ?
            <Text className='pl-2'>Periode Sewa: {diffPeriod.tahun ? diffPeriod.tahun : '0'} Tahun {diffPeriod.bulan ? diffPeriod.bulan : '0'} Bulan</Text> :
            <Text className='pl-2'>Periode Sewa: {diffPeriod.tahun ? diffPeriod.tahun : '0'} Tahun {diffPeriod.bulan ? diffPeriod.bulan : '0'} Bulan</Text>
          }
          {/* <Text className='pl-2'>Periode Sewa: {diffPeriod.tahun ? diffPeriod.tahun : '0'} Tahun {diffPeriod.bulan ? diffPeriod.bulan : '0'} Bulan</Text> */}
        </Row>
        <Row>
          <Text className='pl-2'>Periode Pembayaran: {periodePembayaran}</Text>
        </Row>
        <Row>
          <Text className='pl-2'>Biaya Sewa: {(currencyValue != 0) ? _renderCurrency(hitungHarga(diffPeriod, currencyValue, periodePembayaran)) : 'Rp 0'} </Text>
        </Row>
        <div className="flex justify-end gap-2">
          <Form.Item>
            <Button onClick={() => {
              props.setOpenModal(false);
              props.form.resetFields();
              setDiffPeriod({ tahun: 0, bulan: 0 });
              setCurrencyValue(0)
              setPeriodePembayaran('Perbulan')
              // props.isEdit = false
            }}>Cancel</Button>
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" type="primary"> Sumbit</Button>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  )
}
