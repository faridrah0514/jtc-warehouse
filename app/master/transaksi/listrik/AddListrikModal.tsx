import { Button, Form, Input, Modal, Select, Typography, message, UploadProps, GetProp, DatePicker, Row, Col, Radio, FormInstance, Upload, UploadFile, Image, Table, Popconfirm } from 'antd'
const { Option } = Select;
import React, { useEffect, useRef, useState, ChangeEvent } from 'react'
import { DataAset, DataCabang, DataPelanggan } from '@/app/types/master'
import dayjs, { Dayjs } from 'dayjs';
const { Text, Link } = Typography;
const { RangePicker } = DatePicker;
import type { RadioChangeEvent } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
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
}

interface DiffPeriod { tahun: number, bulan: number }
interface Pemakaian { awal: number, akhir: number }

export default function AddListrikModal(props: Status) {
  const [allData, setAllData] = useState<{ cabang: any, pelanggan: any, aset: any }>({ cabang: [], pelanggan: [], aset: [] })
  const [pemakaian, setPemakaian] = useState<Pemakaian>({ awal: 0, akhir: 0 })
  const [diffPeriod, setDiffPeriod] = useState<DiffPeriod>({ tahun: 0, bulan: 0 })
  const [currencyValue, setCurrencyValue] = useState<number>(0)
  const [periodePembayaran, setPeriodePembayaran] = useState<string>('Perbulan');
  const [selectedCabang, setSelectedCabang] = useState<number | undefined>(undefined)
  const [selectedPelanggan, setSelectedPelanggan] = useState<number | undefined>(undefined)
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [listFiles, setListFiles] = useState([])
  const dateFormat = 'DD-MM-YYYY'
  const [sewaData, setSewaData] = useState<any[]>();

  function hitungHarga(diffPeriod: DiffPeriod, currencyValue: number, periodePembayaran: string): number {
    const totalBulan = (diffPeriod.tahun * 12) + diffPeriod.bulan
    return (periodePembayaran == 'Perbulan') ? currencyValue * totalBulan : currencyValue * totalBulan / 12
  }

  useEffect(
    () => {
      async function getAllData() {
        const sewa = await fetch('/api/master/transaksi/sewa', { method: 'GET', cache: 'no-store' })
        const dataSewa = await sewa.json()
        setSewaData(dataSewa.data)
        if (props.isEdit && props.openModal) {
          const masa_sewa = props.form.getFieldValue("masa_sewa")
          setPemakaian({awal: props.form.getFieldValue("meteran_awal"), akhir: props.form.getFieldValue("meteran_akhir")})
          setSelectedCabang(props.form.getFieldValue("id_cabang"))
          setSewaData([{
            id_pelanggan: props.form.getFieldValue("id_pelanggan"),
            id_aset: props.form.getFieldValue("id_aset"),
            nama_pelanggan: props.form.getFieldValue("nama_pelanggan"),
            nama_cabang: props.form.getFieldValue("nama_cabang"),
            nama_aset: props.form.getFieldValue("nama_aset"),
            id_cabang: props.form.getFieldValue("id_cabang"),
            kwh_rp: props.form.getFieldValue("kwh_rp"),
            rek_bank_1: props.form.getFieldValue("rek_bank_1"),
            rek_bank_2: props.form.getFieldValue("rek_bank_2"),
            rek_norek_1: props.form.getFieldValue("rek_norek_1"),
            rek_norek_2: props.form.getFieldValue("rek_norek_2"),
            rek_atas_nama_1: props.form.getFieldValue("rek_atas_nama_1"),
            rek_atas_nama_2: props.form.getFieldValue("rek_atas_nama_2"),
          }])
          setSelectedPelanggan(props.form.getFieldValue("id_pelanggan"))
        }
      }
      getAllData()
    }, [props.triggerRefresh]
  )

  return (
    <Modal open={props.openModal} footer={null} width={800} title='Form Tagihan Listrik' closeIcon={null}>
      <Form layout='horizontal' form={props.form}
        // fields={(props.isEdit) ? [] : [{
        //   "name": ["id_transaksi"],
        //   "value": 'TXS-' + props.maxId.toString().padStart(4, "0")
        // }]}
        onFinish={
          async function addTagihanListrik(value) {
            value.bln_thn = value.bln_thn.format("MM-YYYY").toString()
            const requestType = (props.isEdit) ? 'edit' : 'add'
            const result = await fetch('/api/master/transaksi/listrik', {
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
            props.form.resetFields()
            setPemakaian({ awal: 0, akhir: 0 })
          }
        }
        labelAlign='left'
        labelCol={{ span: 7 }}
        labelWrap
        wrapperCol={{ span: 15 }}
      >
        <Row>
          <Col span={24}>
            <Form.Item name='id' label="id" hidden >
              <Input placeholder='id' autoComplete='off' hidden />
            </Form.Item>
            <Form.Item name='id_pelanggan' label="Nama Pelanggan" rules={[{ required: true }]}>
              <Select placeholder="Pelanggan" allowClear onChange={(value) => { setSelectedPelanggan(value) }}>
                {
                  Array.from(new Map(sewaData?.map(item => [item.id_pelanggan, item])).values()).map(
                    (value: any, idx) => <Option key={idx} value={value.id_pelanggan}>{value.nama_pelanggan}</Option>
                  )
                }
              </Select>
            </Form.Item>

            <Form.Item name='id_cabang' label="Nama Cabang" rules={[{ required: true }]}>
              <Select placeholder="Cabang" allowClear onChange={(value) => { setSelectedCabang(value) }} disabled={!selectedPelanggan}>
                {
                  Array.from(new Map(
                    sewaData?.filter((value: any) => value.id_pelanggan === selectedPelanggan)
                      .map((value: any) => [value.id_cabang, value])
                  ).values()).map(
                    (value: any, idx) => <Option key={idx} value={value.id_cabang}>{value.nama_cabang}</Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item name='id_aset' label="Nama Aset" rules={[{ required: true }]}>
              <Select placeholder="Aset" allowClear disabled={!selectedCabang}>
                {
                  sewaData?.filter(
                    (value: any) => value.id_pelanggan == selectedPelanggan && value.id_cabang == selectedCabang
                  ).map(
                    (value: any, idx: number) => <Option key={idx} value={value.id_aset}>{value.nama_aset}</Option>
                  )
                }
              </Select>
            </Form.Item>
            <Form.Item
              name='bln_thn' label="BL/THN" rules={[{ required: true }]}>
              <DatePicker allowClear={false} format={'MM-YYYY'} picker='month' />
            </Form.Item>
            <Form.Item
              name='meteran_awal' label="Meteran Awal"
              rules={[
                {
                  required: true,
                  message: 'Please input a number!',
                },
                {
                  pattern: /^[0-9]*\.?[0-9]+$/,
                  message: 'Input must be a number!',
                },
              ]}
            >
              <Input placeholder='Meteran Awal' autoComplete='off' onChange={(e) => { setPemakaian({ awal: Number(e.target.value), akhir: pemakaian.akhir }) }} />
            </Form.Item>
            <Form.Item
              name='meteran_akhir' label="Meteran Akhir"
              rules={[
                {
                  required: true,
                  message: 'Please input a number!',
                },
                {
                  pattern: /^[0-9]*\.?[0-9]+$/,
                  message: 'Input must be a number!',
                },
              ]}
            >
              <Input placeholder='Meteran Akhir' autoComplete='off' onChange={(e) => { setPemakaian({ awal: pemakaian.awal, akhir: Number(e.target.value) }) }} />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col>
            <Row>
              {(pemakaian.akhir - pemakaian.awal) >= 0 ?
                <Text className='pl-2'>Jumlah Pemakaian: {pemakaian.akhir - pemakaian.awal} Kwh</Text> :
                <Text className='pl-2'>Jumlah Pemakaian: 0 Kwh</Text>
              }
            </Row>
            <Row>
              {!selectedCabang ?
                <Text className='pl-2'>Tarif/Kwh: {_renderCurrency(0)}</Text> :
                <Text className='pl-2'>Tarif/Kwh: {_renderCurrency(Number(sewaData?.filter(value => value.id_cabang == selectedCabang)[0].kwh_rp))}</Text>
              }
            </Row>
            <Row>
              {(pemakaian.akhir - pemakaian.awal) >= 0 && selectedCabang ?
                <Text className='pl-2'>Total Tagihan: {_renderCurrency(Number(sewaData?.filter(value => value.id_cabang == selectedCabang)[0].kwh_rp) * (pemakaian.akhir - pemakaian.awal))}</Text> :
                <Text className='pl-2'>Total Tagihan: {_renderCurrency(0)}</Text>
              }
            </Row>
            <Row>
              {selectedCabang ?
                <div>
                  <Text className='pl-2' style={{ display: 'block' }}>Tagihan di transfer ke Rekening Bank {sewaData?.filter(value => value.id_cabang == selectedCabang)[0].rek_bank_1} {sewaData?.filter(value => value.id_cabang == selectedCabang)[0].rek_norek_1} a.n {sewaData?.filter(value => value.id_cabang == selectedCabang)[0].rek_atas_nama_1}</Text>
                  <Text className='pl-2' style={{ display: 'block' }}>Tagihan di transfer ke Rekening Bank {sewaData?.filter(value => value.id_cabang == selectedCabang)[0].rek_bank_2} {sewaData?.filter(value => value.id_cabang == selectedCabang)[0].rek_norek_2} a.n {sewaData?.filter(value => value.id_cabang == selectedCabang)[0].rek_atas_nama_2}</Text>
                </div>
                :
                <></>
              }
            </Row>
          </Col>
        </Row>
        <div className="flex justify-end gap-2">
          <Form.Item>
            <Button onClick={() => {
              props.setOpenModal(false);
              props.form.resetFields();
              setSelectedCabang(undefined)
              setSelectedPelanggan(undefined)
              setPemakaian({ awal: 0, akhir: 0 })
            }}>Cancel</Button>
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" type="primary">Buat Tagihan</Button>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  )
}