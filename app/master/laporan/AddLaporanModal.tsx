import { Button, DatePicker, Form, FormInstance, Input, InputNumber, Modal, Select, Space, Spin, message } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import React, { useEffect, useState } from 'react'
import { DataCabang } from '@/app/types/master'
import { CurrencyInput } from '@/app/components/currencyInput/currencyInput'
import { SearchOutlined } from '@ant-design/icons'
const { Option } = Select;
const { RangePicker } = DatePicker;

interface Status {
  openModal: boolean,
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>,
  triggerRefresh: boolean,
  setTriggerRefresh: React.Dispatch<React.SetStateAction<boolean>>,
  form: FormInstance,
  // isEdit: boolean
  data: any,
}

export default function AddLaporanModal(props: Status) {

  const CABANG_OPTIONS = props.data.cabangData.map((val: any, idx: number) => { return { key: idx, id: val.id, name: val.nama_perusahaan}})
  const ASET_OPTIONS = props.data.asetData.map((val: any, idx: number) => { return {key: idx, id: val.id, name: val.nama_aset, cabangId: val.id_cabang}})

  const [uploading, setUploading] = useState(false);
  const [loading, setloading] = useState(true);
  const [allData, setAllData] = useState<any>();
  const [jenisLaporan, setJenisLaporan] = useState<string>('')

  const [selectedCabang, setSelectedCabang] = useState<number[]>([]);
  const [selectedAset, setSelectedAset] = useState<number[]>([]);
  const [filteredCabang, setFilteredCabang] = useState(CABANG_OPTIONS);
  const [filteredAset, setFilteredAset] = useState(ASET_OPTIONS);

  // Update filtered cabang
  useEffect(() => {
    setFilteredCabang(CABANG_OPTIONS.filter((cabang: any) => !selectedCabang.includes(cabang.id)));
  }, [selectedCabang]);

  // Update filtered aset based on selected cabang
  useEffect(() => {
    const selectedCabangSet = new Set(selectedCabang);
    const newFilteredAset = ASET_OPTIONS.filter((aset: any) => selectedCabangSet.has(aset.cabangId) && !new Set(selectedAset).has(aset.id));
    setFilteredAset(newFilteredAset);
  }, [selectedCabang]);

  useEffect(() => {
    setFilteredAset(filteredAset.filter((aset: any) => !selectedAset.includes(aset.id)));
  }, [selectedAset]);


  async function addLaporan(value: any) {
    
    // const result = await 
    // value.aset = value.aset.map((v) => )
    value.aset = value.aset.map((asetId: number) => {
      const foundAset = ASET_OPTIONS.find((option:any) => option.id === asetId);
      return foundAset ? foundAset.name : null;
    });

    value.cabang = value.cabang.map((cabangId: number) => {
      const foundCabang = CABANG_OPTIONS.find((option:any) => option.id === cabangId);
      return foundCabang ? foundCabang.name : null;
    });

    fetch('/api/master/laporan', {
      method: 'POST',
      body: JSON.stringify({
        data: value,
        requestType: 'add'
      }), headers: {
        'Content-Type': 'application/json',
      }
    }).then((res) => res.json())
      .then((res) => {
        if (res.status == 200) {
          message.success("Tambah laporan berhasil")
        } else {
          message.error("Tambah laporan gagal")
        }
      }).catch(() => message.error("Tambah laporan gagal"))
      .finally(() => {
        props.setOpenModal(false)
        props.setTriggerRefresh(!props.triggerRefresh)
        setFilteredCabang(CABANG_OPTIONS)
        setFilteredAset(ASET_OPTIONS)
        setSelectedCabang([])
        setSelectedAset([])
        props.form.resetFields()
      })
  }

  return (
    <Modal open={props.openModal} footer={null} title='Form Tambah Cabang' closeIcon={null} width={800} >
      <Form form={props.form} layout='vertical' autoComplete='off' onFinish={addLaporan}>
        {/* {props.isEdit &&
          <Form.Item name='id' required label="id" rules={[{ required: true }]} hidden>
            <Input placeholder='id' autoComplete='off' />
          </Form.Item>
        } */}
        <Form.Item name='jenis_laporan' required label="Jenis Laporan" rules={[{ required: true }]}>
          <Select placeholder='Jenis Laporan' allowClear onChange={(value) => setJenisLaporan(value)}>
            <Option value='cabang'>Cabang</Option>
            <Option value='aset'>Aset</Option>
            <Option value='transaksi_sewa'>Transaksi Sewa</Option>
            {/* <Option value='transaksi_listrik'>Transaksi Listrik</Option> */}
            {/* <Option value='transaksi_ipl'>Transaksi IPL</Option> */}
          </Select>
        </Form.Item>
        <Form.Item name='cabang' label="Cabang">
          <Select
            mode="multiple"
            placeholder="Pilih Cabang"
            value={selectedCabang}
            onChange={(value) => setSelectedCabang(value)}
            style={{ width: '100%' }}
            options={filteredCabang.map((item: any, idx: number) => ({
              key: item.key,
              value: item.id,  // Ensure this is a primitive value
              label: item.name, // Ensure this is a primitive value
            }))}
          />
        </Form.Item>
        <Form.Item name='aset' label="Aset">
          <Select
            disabled={selectedCabang.length === 0}
            mode="multiple"
            placeholder="Pilih Aset"
            value={selectedAset}
            onChange={(value) => {setSelectedAset(value)}}
            style={{ width: '100%' }}
            options={filteredAset.map((item: any, idx: number) => ({
              key: item.key,
              value: item.id,  // Ensure this is a primitive value
              label: item.name, // Ensure this is a primitive value
            }))}
          />
        </Form.Item>
        <Form.Item name='periode' label="Periode">
          {/* <RangePicker picker="month" format={'MM-YYYY'} /> */}
          <DatePicker picker='year' format='YYYY'/>
        </Form.Item>
        <div className="flex justify-end gap-2">
          <Form.Item>
            <Button onClick={() => {
              props.setOpenModal(false);
              props.form.resetFields()
              setFilteredCabang(CABANG_OPTIONS)
              setFilteredAset(ASET_OPTIONS)
              setSelectedCabang([])
              setSelectedAset([])
            }}>Cancel</Button>
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" type="primary" loading={uploading}>{uploading ? 'Uploading' : 'Submit'}</Button>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  )
}
