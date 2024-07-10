import { Button, Form, Input, Modal, Select, Typography, UploadProps, GetProp, DatePicker, Row, Col, FormInstance, Steps } from 'antd'
const { Option } = Select;
import React, { useEffect, useRef, useState, ChangeEvent } from 'react'
const { Text } = Typography;
import { _renderCurrency } from '@/app/utils/renderCurrency';
import dayjs from 'dayjs';


type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0]

interface Status {
  children?: React.ReactNode,
  openModal: boolean,
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>,
  triggerRefresh: boolean,
  setTriggerRefresh: React.Dispatch<React.SetStateAction<boolean>>
  form: FormInstance,
  isEdit: boolean,
  tagihanListrik: any[]
}

interface DiffPeriod { tahun: number, bulan: number }
interface Pemakaian { awal: number, akhir: number }

export default function AddListrikModal(props: Status) {
  const [pemakaian, setPemakaian] = useState<Pemakaian>({ awal: 0, akhir: 0 })
  const [selectedCabang, setSelectedCabang] = useState<number | undefined>(undefined)
  const [selectedPelanggan, setSelectedPelanggan] = useState<number | undefined>(undefined)
  const [selectedAset, setSelectedAset] = useState<number | undefined>(undefined)
  const [sewaData, setSewaData] = useState<any[]>();
  const [meteranAkhir, setMeteranAkhir] = useState<number | undefined>(undefined)

  async function getAllData() {
    const sewa = await fetch('/api/master/transaksi/sewa', { method: 'GET', cache: 'no-store' })
    const dataSewa = await sewa.json()
    setSewaData(dataSewa.data)
    if (props.isEdit && props.openModal) {
      const masa_sewa = props.form.getFieldValue("masa_sewa")
      setPemakaian({ awal: props.form.getFieldValue("meteran_awal"), akhir: props.form.getFieldValue("meteran_akhir") })
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
    setPemakaian({ awal: 0, akhir: 0 })
    setMeteranAkhir(undefined)
    setSelectedAset(undefined)
    setSelectedCabang(undefined)
    setSelectedPelanggan(undefined)
    setCurrent(0)
  }

  useEffect(
    () => {
      getAllData()
    }, [props.triggerRefresh]
  )

  // useEffect(
  //   () => {
  //     setMeteranAkhir(meteranAkhir)
  //   }, [meteranAkhir]
  // )

  async function addTagihanListrik(value: any) {
    value.bln_thn = value.bln_thn.format("MM-YYYY").toString()
    const requestType = (props.isEdit) ? 'edit' : 'add'
    await fetch('/api/master/transaksi/listrik', {
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
    setMeteranAkhir(0)
    setSelectedAset(undefined)
    setSelectedCabang(undefined)
    setSelectedPelanggan(undefined)
    setCurrent(0)
  }
  const steps = [
    {
      title: 'Data Sewa',
      content: 'First-content',
    },
    {
      title: 'Data Meteran',
      content: 'Second-content',
    },
  ]

  const items = steps.map((item) => ({ key: item.title, title: item.title }));
  const [current, setCurrent] = useState(0);

  const next = () => {
    setMeteranAkhir(meteranAkhir)
    setCurrent(current + 1);
  };

  const prev = () => {
    setMeteranAkhir(meteranAkhir)
    setCurrent(current - 1);
  };

  return (
    <Modal open={props.openModal} footer={null} width={800} title='Form Tagihan Listrik' closeIcon={null}>
      <Row>
        <Col span={4}>
          <Steps direction='vertical' size='small' current={current} items={items} />
        </Col>
        <Col span={20}>
          <Form layout='horizontal' form={props.form}
            // fields={(props.isEdit) ? [] : [{
            //   "name": ["id_transaksi"],
            //   "value": 'TXS-' + props.maxId.toString().padStart(4, "0")
            // }]}
            onFinish={addTagihanListrik}
            labelAlign='left'
            labelCol={{ span: 7 }}
            labelWrap
            wrapperCol={{ span: 15 }}
          // initialValues={{ meteran_awal: meteranAkhir }}
          >
            <Row>
              <Col span={24}>
                {/* {current < steps.length - 1 && ( */}
                {/* <> */}
                <Form.Item name='id' label="id" hidden >
                  <Input placeholder='id' autoComplete='off' hidden />
                </Form.Item>
                <Form.Item name='id_pelanggan' label="Nama Pelanggan" rules={[{ required: true }]} hidden={current == 1}>
                  {/* <Select placeholder="Pelanggan" allowClear onChange={(value) => { setSelectedPelanggan(value) }} disabled>
                    {
                      Array.from(new Map(sewaData?.map(item => [item.id_pelanggan, item])).values()).map(
                        (value: any, idx) => <Option key={idx} value={value.id_pelanggan}>{value.nama_pelanggan}</Option>
                      )
                    }
                  </Select> */}
                  {/* <Input placeholder={props.form.getFieldValue("nama_pelanggan")} disabled></Input> */}
                  <Text>{props.form.getFieldValue("nama_pelanggan")}</Text>
                </Form.Item>
                <Form.Item name='id_cabang' label="Nama Cabang" rules={[{ required: true }]} hidden={current == 1}>
                  {/* <Select placeholder="Cabang" allowClear onChange={(value) => { setSelectedCabang(value) }} disabled>
                    {
                      Array.from(new Map(
                        sewaData?.filter((value: any) => value.id_pelanggan === selectedPelanggan)
                          .map((value: any) => [value.id_cabang, value])
                      ).values()).map(
                        (value: any, idx) => <Option key={idx} value={value.id_cabang}>{value.nama_cabang}</Option>)
                    }
                  </Select> */}
                  {/* <Input placeholder={props.form.getFieldValue("nama_cabang")} disabled></Input> */}
                  <Text>{props.form.getFieldValue("nama_cabang")}</Text>
                </Form.Item>
                <Form.Item name='id_aset' label="Nama Aset" rules={[{ required: true }]} hidden={current == 1}>
                  {/* <Select placeholder="Aset" allowClear disabled={!selectedCabang} onChange={(value) => { setSelectedAset(value) }}>
                    {
                      sewaData?.filter(
                        (value: any) => value.id_pelanggan == selectedPelanggan && value.id_cabang == selectedCabang
                      ).map(
                        (value: any, idx: number) => <Option key={idx} value={value.id_aset}>{value.nama_aset}</Option>
                      )
                    }
                  </Select> */}
                  {/* <Input placeholder={props.form.getFieldValue("nama_aset")} value={props.form.getFieldValue("nama_aset")}disabled></Input> */}
                  <Text>{props.form.getFieldValue("nama_aset")}</Text>
                </Form.Item>
                
                <Form.Item
                  name='bln_thn'
                  label="BL/THN"
                  rules={[{ required: true }]}
                  hidden={current == 1}
                >
                  <DatePicker
                    allowClear={false}
                    format={'MM-YYYY'}
                    picker='month'
                    onChange={(date, dateString) => {
                      try {
                        const get_max = props.tagihanListrik.filter((value: any) => value.id_pelanggan == selectedPelanggan && value.id_cabang == selectedCabang && value.id_aset == selectedAset)
                          .map(value => dayjs(value.bln_thn, "MM-YYYY"))?.reduce((max, current) => current.isAfter(max) ? current : max, dayjs("01-01-1970", "DD-MM-YYYY")).format("MM-YYYY") || 0
                        const meteran_akhir = props.tagihanListrik.filter((value: any) => value.id_pelanggan == selectedPelanggan && value.id_cabang == selectedCabang && value.id_aset == selectedAset && value.bln_thn == get_max)[0]['meteran_akhir'] || 0
                        // setMeteranAkhir(meteran_akhir)
                        setMeteranAkhir(meteranAkhir => meteran_akhir)
                        setPemakaian({awal: meteran_akhir, akhir: pemakaian.akhir})
                        // props.setTriggerRefresh(!props.triggerRefresh)
                        props.form.setFieldValue("meteran_awal", meteran_akhir)
                
                      } catch (e) {
                        setMeteranAkhir(0)
                        console.log("e: ", e)
                      }
                    }}
                    disabledDate={(current) => {
                      try {
                        const pilihan = sewaData?.filter((value: any) => value.id_pelanggan == selectedPelanggan && value.id_cabang == selectedCabang && value.id_aset == selectedAset)[0]
                        const bulanAwal = pilihan['start_date_sewa']
                        const bulanAkhir = pilihan['end_date_sewa']
                        return current <= dayjs(bulanAwal, "DD-MM-YYYY") || current > dayjs(bulanAkhir, "DD-MM-YYYY") || current <= dayjs(Math.max(...props.tagihanListrik.filter(
                          (value: any) => value.id_pelanggan == selectedPelanggan && value.id_cabang == selectedCabang && value.id_aset == selectedAset
                        ).map(value => dayjs(value.bln_thn, "MM-YYYY")).map(value => value.valueOf()))).add(1, 'month')
                      } catch (e) { return false}
                    }}
                    // disabled={!selectedAset}
                  />
                </Form.Item>
                {/* </> */}
                {/* )} */}
                {/* {current === steps.length - 1 && ( */}
                {/* <> */}
                
                {current == 1 && (
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
                    <Input
                      placeholder={meteranAkhir ? String(meteranAkhir) : 'Meteran Awal'}
                      autoComplete='off'
                      onChange={(e) => { setPemakaian({ awal: Number(e.target.value), akhir: pemakaian.akhir }) }}
                      value={meteranAkhir}
                    />
                  </Form.Item>
                //   <MeteranAwalInput
                //   meteranAwal={meteranAkhir}
                //   onChange={(value) => {
                //     setMeteranAkhir(value);
                //   }}
                // />
                )}

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
                  hidden={current == 0}
                >
                  <Input placeholder='Meteran Akhir' autoComplete='off' onChange={(e) => { setPemakaian({ awal: pemakaian.awal, akhir: Number(e.target.value) }) }} />
                </Form.Item>
                {current == 1 && (
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
                )}

                {/* </> */}
                {/* )} */}
              </Col>
            </Row>
            <div className="flex justify-end gap-2 pt-5">
              <Form.Item>
                <Button onClick={() => {
                  props.setOpenModal(false);
                  props.form.resetFields();
                  setSelectedCabang(undefined)
                  setSelectedPelanggan(undefined)
                  setPemakaian({ awal: 0, akhir: 0 })
                  setMeteranAkhir(0)
                  setSelectedAset(undefined)
                  setCurrent(0)
                  props.setTriggerRefresh(!props.triggerRefresh)
                }}>Cancel</Button>
              </Form.Item>
              {current < steps.length - 1 && (
                <Button type="primary" onClick={() => { console.log("current: ", current); next() }}>
                  Next
                </Button>
              )}
              {current > 0 && (
                <Button style={{ margin: '0 8px' }} onClick={() => { console.log("current: ", current); prev() }}>
                  Previous
                </Button>
              )}
              {current === steps.length - 1 && (
                <Form.Item>
                  <Button htmlType="submit" type="primary">Buat Tagihan</Button>
                </Form.Item>
              )}
            </div>
          </Form>
        </Col>
      </Row>
    </Modal>
  )
}