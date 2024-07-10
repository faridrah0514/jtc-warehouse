import { Button, Form, Input, Modal, Select, Typography, message, UploadProps, GetProp, DatePicker, Row, Col, Radio, FormInstance, Upload, UploadFile, Image, Table, Popconfirm } from 'antd'
const { Option } = Select;
import React, { useEffect, useRef, useState, ChangeEvent } from 'react'
import { DataAset, DataCabang, DataPelanggan } from '@/app/types/master'
import dayjs, { Dayjs } from 'dayjs';
const { Text, Link } = Typography;
const { RangePicker } = DatePicker;
import type { RadioChangeEvent } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { list } from 'postcss';
import { _renderCurrency } from '@/app/utils/renderCurrency';
import { CurrencyInput } from '@/app/components/currencyInput/currencyInput';


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

interface DiffPeriod { tahun: number, bulan: number }

export default function AddIPLModal(props: Status) {
  const [allData, setAllData] = useState<{ cabang: any, pelanggan: any, aset: any }>({ cabang: [], pelanggan: [], aset: [] })
  const [diffPeriod, setDiffPeriod] = useState<DiffPeriod>({ tahun: 0, bulan: 0 })
  const [currencyValue, setCurrencyValue] = useState<number>(0)
  const [iplValue, setIplValue] = useState<number>(0)
  const [periodePembayaran, setPeriodePembayaran] = useState<string>('Perbulan');
  const [selectedCabang, setSelectedCabang] = useState<number | undefined>(undefined)
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [listFiles, setListFiles] = useState([])
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
    <Modal open={props.openModal} footer={null} title='Form Tagihan IPL' closeIcon={null}>
      <Form layout='horizontal' form={props.form}
        onFinish={
          async function addTagihanIPL(value) {
            value.bulan_ipl = value.bulan_ipl.format('YYYY-MM').toString()
            const requestType = (props.isEdit) ? 'edit' : 'add'
            const result = await fetch('/api/master/transaksi/ipl', {
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
            props.setOpenModal(false)
            props.setTriggerRefresh(!props.triggerRefresh)
          }
        }
        labelAlign='left'
      >
          <Form.Item name='bulan_ipl' label="Bulan IPL" required rules={[{ required: true }]}>
            {/* <Input placeholder='Masukkan Tipe Aset' autoComplete='off' /> */}
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
