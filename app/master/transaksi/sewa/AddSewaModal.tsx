import { Button, Form, Input, Modal, Select, Typography, UploadProps, GetProp, DatePicker, Row, Col, Radio, FormInstance } from 'antd'
const { Option } = Select;
import React, { useEffect, useRef, useState, ChangeEvent } from 'react'
import { DataAset, DataCabang, DataPelanggan } from '@/app/types/master'
import dayjs, { Dayjs } from 'dayjs';
const { Text, Link } = Typography;
const { RangePicker } = DatePicker;
import type { RadioChangeEvent } from 'antd';

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0]

interface Status {
  openModal: boolean,
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>,
  triggerRefresh: boolean,
  setTriggerRefresh: React.Dispatch<React.SetStateAction<boolean>>
  form: FormInstance,
  isEdit: boolean,
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
  // const formRef = useRef(null);
  const [form] = Form.useForm<any>()
  // const [harga, setHarga] = useState('')
  const [currencyValue, setCurrencyValue] = useState<number>(0)
  const [periodePembayaran, setPeriodePembayaran] = useState<string>('Perbulan');
  const dateFormat = 'YYYY-MM-DD'
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(true)

  function hitungHarga(diffPeriod: DiffPeriod, currencyValue: number, periodePembayaran: string): number {
    const totalBulan = (diffPeriod.tahun * 12) + diffPeriod.bulan
    return (periodePembayaran == 'Perbulan') ? currencyValue * totalBulan : currencyValue * totalBulan / 12
  }
  // console.log("props.form: ", props.form.getFieldsValue())



  const handleDateChange = (dates: [Dayjs | null, Dayjs | null], dateStrings: [string, string]) => {
    if (dates && dates[0] && dates[1]) {
      const totalMonths = dayjs(dateStrings[1]).diff(dayjs(dateStrings[0]).subtract(1, 'day'), 'month');
      const years = Math.floor(totalMonths / 12);
      let months = totalMonths % 12;
      const endOfMonthPeriod = dayjs(dateStrings[0]).add(months, 'month').add(years, 'years');

      let days = dayjs(dateStrings[1]).diff(endOfMonthPeriod.subtract(1, 'day'), 'day');
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
        const dataPelanggan = (await allPelanggan.json()).data.map((value: DataPelanggan) => { return { id: value.id, nama: value.nama } })
        const dataAset = (await allAset.json()).data.map((value: DataAset) => { return { id: value.id, nama_aset: value.nama_aset } })
        if (dataCabang || dataPelanggan || dataAset) {
          setAllData({
            cabang: dataCabang,
            pelanggan: dataPelanggan,
            aset: dataAset
          })
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
        onFinish={
          async function addSewa(value) {
            value.start_date_sewa = value.masa_sewa[0].format(dateFormat).toString()
            value.end_date_sewa = value.masa_sewa[1].format(dateFormat).toString()
            value.tanggal_akte = value.tanggal_akte.format(dateFormat).toString()
            value.total_biaya_sewa = hitungHarga(diffPeriod, currencyValue, periodePembayaran)
            const requestType = (props.isEdit) ? 'edit': 'add'
            const result = await fetch('/api/master/transaksi/sewa', {
              method: 'POST', body: JSON.stringify({
                requestType: requestType,
                data: value,
              }), headers: {
                'Content-Type': 'application/json',
              },
            })
            console.log("value sewa --> ", value)
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
          <Col span={24}>
            <Form.Item name='id' label="id"  >
              <Input  placeholder='id' autoComplete='off' />
            </Form.Item>
            <Form.Item name='no_akte' required label="Nomor Akte" rules={[{ required: true }]}>
              <Input placeholder='Nomor Akte' autoComplete='off' />
            </Form.Item>
            <Form.Item
              name='tanggal_akte' required label='Tanggal Akte' rules={[{ required: true }]}>
              <DatePicker value={(props.isEdit) ? dayjs(props.form.getFieldValue("tanggal_akte")) : null} allowClear={false}
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
              <Select placeholder="Cabang" allowClear>
                {allData.cabang.map(
                  (value: any) => <Option key={value.id} value={value.id}>{value.nama_perusahaan}</Option>
                )}
              </Select>
            </Form.Item>
            <Form.Item name='id_aset' required label="Nama Aset" rules={[{ required: true }]}>
              <Select placeholder="Aset" allowClear>
                {allData.aset.map(
                  (value: any) => <Option key={value.id} value={value.id}>{value.nama_aset}</Option>
                )}
              </Select>
            </Form.Item>
            <Form.Item
              name='masa_sewa' required label="Masa Sewa" rules={[{ required: true }]}>
              <RangePicker allowClear={false} onChange={ handleDateChange
                
              //   (a, b) => {
              //   const totalMonths = dayjs(b[1]).diff(dayjs(b[0]).subtract(1, 'day'), 'month')
              //   const years = Math.floor(totalMonths / 12);
              //   let months = totalMonths % 12;
              //   const endOfMonthPeriod = dayjs(b[0]).add(months, 'month').add(years, 'years')

              //   let days = dayjs(b[1]).diff(endOfMonthPeriod.subtract(1, 'day'), 'day')
              //   if (days > 1) {
              //     months = months + 1
              //     days = 0
              //   }
              //   setDiffPeriod({ tahun: years, bulan: months })

              // }
            
            }
                // value={[dayjs('2015-01-01', dateFormat), dayjs('2015-01-01', dateFormat)]} 
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
