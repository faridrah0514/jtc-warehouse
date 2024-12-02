import { Button, Form, Input, Modal, Select, Typography, message, GetProp, DatePicker, Row, Col, FormInstance, Steps } from 'antd'
const { Option } = Select;
import React, { useEffect, useState } from 'react'
const { Text, Link } = Typography;
import { _renderCurrency } from '@/app/utils/renderCurrency';
import dayjs from 'dayjs';

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

export default function AddListrikModalV2(props: Status) {
  const [uploading, setUploading] = useState(false);
  const [pemakaian, setPemakaian] = useState<Pemakaian>({ awal: 0, akhir: 0 })
  const [meteranAkhir, setMeteranAkhir] = useState<number | undefined>(undefined)

  async function getAllData() {
    // const sewa = await fetch('/api/master/transaksi/sewa', { method: 'GET', cache: 'no-store' })
    if (props.isEdit && props.openModal) {
      setPemakaian({ awal: props.form.getFieldValue("meteran_awal"), akhir: props.form.getFieldValue("meteran_akhir") })
    }
    setPemakaian({ awal: 0, akhir: 0 })
    setMeteranAkhir(undefined)
    setCurrent(0)
  }

  useEffect(
    () => {
      getAllData()
    }, [props.triggerRefresh]
  )

  async function addTagihanListrik(value: any) {
    setUploading(true)
    value.bln_thn = value.bln_thn.format("MM-YYYY").toString()
    value.id_sewa = value.id
    const requestType = (props.isEdit) ? 'edit' : 'add'
    fetch('/api/master/transaksi/listrik', {
      method: 'POST', body:
        JSON.stringify({
          requestType: requestType,
          data: value,
        })
      ,
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((res) => res.json())
      .then((res) => {
        if (res.status == 200) {
          message.success("Tambah/Edit tagihan listrik berhasil")
        } else {
          message.error("Tambah/Edit tagihan listrik gagal")
        }
      })
      .catch(() => message.error("Tambah/Edit tagihan listrik gagal"))
      .finally(() => {
        props.setOpenModal(false)
        setUploading(false)
      })
    props.setTriggerRefresh(!props.triggerRefresh)
    props.form.resetFields()
    setPemakaian({ awal: 0, akhir: 0 })
    setMeteranAkhir(0)
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
            onFinish={addTagihanListrik}
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
                <Form.Item name='id_cabang' label="Nama Cabang" rules={[{ required: true }]} hidden={current == 1}>
                  <Text>{props.form.getFieldValue("nama_cabang")}</Text>
                </Form.Item>
                <Form.Item name='id_aset' label="Nama Aset" rules={[{ required: true }]} hidden={current == 1}>
                  <Text>{props.form.getFieldValue("nama_aset")}</Text>
                </Form.Item>
                <Form.Item name='id_pelanggan' label="Nama Pelanggan" rules={[{ required: true }]} hidden={current == 1}>
                  <Text>{props.form.getFieldValue("nama_pelanggan")}</Text>
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
                        const selectedDate = date.subtract(1, 'month').format("MM-YYYY");
                        const previousMonthData = props.tagihanListrik.find((value: any) => value.bln_thn === selectedDate);
                        // const get_max = props.tagihanListrik
                        //   .map(value => dayjs(value.bln_thn, "MM-YYYY"))?.reduce((max, current) => current.isAfter(max) ? current : max, dayjs("01-01-1970", "DD-MM-YYYY")).format("MM-YYYY") || 0
                        // const meteran_akhir = props.tagihanListrik.filter((value: any) => value.bln_thn == get_max)[0]['meteran_akhir'] || 0
                        const meteran_akhir = previousMonthData?.meteran_akhir || 0
                        setMeteranAkhir(meteranAkhir => meteran_akhir)
                        setPemakaian({ awal: meteran_akhir, akhir: pemakaian.akhir })
                        props.form.setFieldValue("meteran_awal", meteran_akhir)
                      } catch (e) {
                        setMeteranAkhir(0)
                        console.log("e: ", e)
                      }
                    }}
                    disabledDate={(current) => {
                      try {
                        const bulanAwal = props.form.getFieldValue("start_date_sewa")
                        const bulanAkhir = props.form.getFieldValue("end_date_sewa")
                        // return current <= dayjs(bulanAwal, "DD-MM-YYYY") || current > dayjs(bulanAkhir, "DD-MM-YYYY") || current <= dayjs(Math.max(...props.tagihanListrik.map(value => dayjs(value.bln_thn, "MM-YYYY")).map(value => value.valueOf()))).add(1, 'month')
                        return current <= dayjs(bulanAwal, "DD-MM-YYYY").subtract(2, 'month').endOf('month') || current >= dayjs(bulanAkhir, "DD-MM-YYYY").add(2, 'month').endOf('month')
                      } catch (e) { return false }
                    }}
                  />
                </Form.Item>
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
                        {(pemakaian.akhir - pemakaian.awal) > 0 ?
                          <Text className='pl-2'>Jumlah Pemakaian: {pemakaian.akhir - pemakaian.awal} Kwh</Text> :
                          <Text className='pl-2'>Jumlah Pemakaian: {(props.form.getFieldValue("meteran_akhir") || props.form.getFieldValue("meteran_awal")) ? props.form.getFieldValue("meteran_akhir") - props.form.getFieldValue("meteran_awal") : 0} Kwh</Text>
                        }
                      </Row>
                      <Row>
                        <Text className='pl-2'>Tarif/Kwh: {_renderCurrency(props.form.getFieldValue("kwh_rp"))}</Text>
                      </Row>
                      <Row>
                        {(pemakaian.akhir - pemakaian.awal) > 0 ?
                          <Text className='pl-2'>Total Tagihan: {_renderCurrency(Number(props.form.getFieldValue("kwh_rp")) * (pemakaian.akhir - pemakaian.awal))}</Text> :
                          <Text className='pl-2'>Total Tagihan: {(props.form.getFieldValue("meteran_akhir") || props.form.getFieldValue("meteran_awal")) ? _renderCurrency(Number(props.form.getFieldValue("kwh_rp")) * (props.form.getFieldValue("meteran_akhir") - props.form.getFieldValue("meteran_awal"))) : _renderCurrency(0)}</Text>
                        }
                      </Row>
                      <Row>
                        <div>
                          <Text className='pl-2' style={{ display: 'block' }}>Tagihan di transfer ke Rekening Bank {props.form.getFieldValue("rek_bank_1")} {props.form.getFieldValue("rek_norek_1")} a.n {props.form.getFieldValue("rek_atas_nama_1")}</Text>
                          <Text className='pl-2' style={{ display: 'block' }}>Tagihan di transfer ke Rekening Bank {props.form.getFieldValue("rek_bank_2")} {props.form.getFieldValue("rek_norek_2")} a.n {props.form.getFieldValue("rek_atas_nama_2")}</Text>
                        </div>
                      </Row>
                    </Col>
                  </Row>
                )}
              </Col>
            </Row>
            <div className="flex justify-end gap-2 pt-5">
              <Form.Item>
                <Button onClick={() => {
                  props.setOpenModal(false);
                  props.form.resetFields();
                  setPemakaian({ awal: 0, akhir: 0 })
                  setMeteranAkhir(0)
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
                  <Button htmlType="submit" type="primary" loading={uploading}>{(uploading) ? 'Uploading' : 'Submit'}</Button>
                </Form.Item>
              )}
            </div>
          </Form>
        </Col>
      </Row>
    </Modal>
  )
}