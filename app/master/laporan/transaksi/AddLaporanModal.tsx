import { Button, Checkbox, DatePicker, Form, FormInstance, Modal, Select, message, Divider } from 'antd';
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

const { Option } = Select;

interface Status {
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  triggerRefresh: boolean;
  setTriggerRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  form: FormInstance;
  data: any;
}

export default function AddLaporanModal(props: Status) {
  const CABANG_OPTIONS = props.data.cabangData.map((val: any, idx: number) => ({ key: idx, id: val.id, name: val.nama_perusahaan }));
  const ASET_OPTIONS = props.data.asetData.map((val: any, idx: number) => ({ key: idx, id: val.id, name: val.nama_aset, cabangId: val.id_cabang }));

  const [uploading, setUploading] = useState(false);
  const [jenisLaporan, setJenisLaporan] = useState<string>('');

  const [selectedCabang, setSelectedCabang] = useState<number[]>([]);
  const [selectedAset, setSelectedAset] = useState<number[]>([]);
  const [filteredCabang, setFilteredCabang] = useState(CABANG_OPTIONS);
  const [filteredAset, setFilteredAset] = useState(ASET_OPTIONS);

  const [isAllCabang, setIsAllCabang] = useState(false);
  const [isAllAset, setIsAllAset] = useState(false);

  useEffect(() => {
    setFilteredCabang(CABANG_OPTIONS.filter((cabang: any) => !selectedCabang.includes(cabang.id)));
  }, [selectedCabang]);

  useEffect(() => {
    const selectedCabangSet = new Set(selectedCabang);
    const newFilteredAset = ASET_OPTIONS.filter((aset: any) => selectedCabangSet.has(aset.cabangId) && !new Set(selectedAset).has(aset.id));
    setFilteredAset(newFilteredAset);
  }, [selectedCabang]);

  useEffect(() => {
    setFilteredAset(filteredAset.filter((aset: any) => !selectedAset.includes(aset.id)));
  }, [selectedAset]);

  async function addLaporan(value: any) {
    // Include isAllCabang and isAllAset in the value object
    value.isAllCabang = isAllCabang;
    value.isAllAset = isAllAset;

    // If "all-cabang" is selected, clear the specific cabang list
    if (isAllCabang) {
      value.cabang = 'Semua Cabang'; // Or set to an appropriate identifier
    } else {
      value.cabang = value.cabang.map((cabangId: number) => {
        const foundCabang = CABANG_OPTIONS.find((option: any) => option.id === cabangId);
        return foundCabang ? foundCabang.name : null;
      }).join(', ');
    }

    // If "all-aset" is selected, clear the specific aset list
    if (isAllAset) {
      value.aset = 'Semua Aset'; // Or set to an appropriate identifier
    } else {
      value.aset = value.aset?.map((asetId: number) => {
        const foundAset = ASET_OPTIONS.find((option: any) => option.id === asetId);
        return foundAset ? foundAset.name : null;
      }).join(', ');
    }

    // Handle the period formatting
    if (value.jenis_laporan === 'transaksi_listrik_bulanan') {
      value.periode = dayjs(value.periode).format('MM-YYYY'); // Format as month-year
    } else if (value.jenis_laporan === 'daftar_penyewa_per_blok') {
      value.periode = null
    } else {
      value.periode = dayjs(value.periode).year().toString();
    } // Format as year only
    // Send the data to the server
    fetch('/api/master/laporan', {
      method: 'POST',
      body: JSON.stringify({
        data: value,
        requestType: 'add',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((res) => res.json())
      .then((res) => {
        if (res.status === 200) {
          message.success('Tambah laporan berhasil');
        } else {
          message.error('Tambah laporan gagal');
        }
      }).catch(() => message.error('Tambah laporan gagal'))
      .finally(() => {
        props.setOpenModal(false);
        props.setTriggerRefresh(!props.triggerRefresh);
        setFilteredCabang(CABANG_OPTIONS);
        setFilteredAset(ASET_OPTIONS);
        setSelectedCabang([]);
        setSelectedAset([]);
        setIsAllCabang(false);
        setIsAllAset(false);
        props.form.resetFields();
      });
  }


  return (
    <Modal open={props.openModal} footer={null} title='Form Tambah Laporan' closeIcon={null} width={600}>
      <Form form={props.form} layout='vertical' autoComplete='off' onFinish={addLaporan}>

        {/* Jenis Laporan Section */}
        <Form.Item name='jenis_laporan' label="Jenis Laporan" required rules={[{ required: true }]}>
          <Select placeholder='Jenis Laporan' allowClear onChange={(value) => {
            setJenisLaporan(value);
            props.form.resetFields();
            props.form.setFieldValue('jenis_laporan', value);
          }}>
            <Option value='jatuh_tempo'>Jatuh Tempo</Option>
            <Option value='transaksi_listrik_bulanan'>Transaksi Listrik Bulanan</Option>
            <Option value='transaksi_listrik_tahunan'>Transaksi Listrik Tahunan</Option>
            <Option value='transaksi_ipl'>Transaksi IPL</Option>
            <Option value='daftar_penyewa_per_blok'>Daftar Penyewa Per-Blok</Option>
            <Option value='daftar_penyewa_per_tahun'>Daftar Penyewa Per-Tahun</Option>
          </Select>
        </Form.Item>

        <Divider />

        {/* Cabang Section */}
        <Form.Item label="Cabang" name="semua-cabang">
          <Checkbox
            checked={isAllCabang}
            onChange={(e) => {
              setIsAllCabang(e.target.checked);
              if (e.target.checked) {
                setSelectedCabang([]); // Clear selected cabang if "All-Cabang" is checked
              }
            }}
          >
            Pilih Semua Cabang
          </Checkbox>
        </Form.Item>

        <Form.Item
          name='cabang'
          required={!isAllCabang}
          rules={[{ required: !isAllCabang, message: 'Cabang is required' }]}
        >
          <Select
            mode="multiple"
            placeholder="Pilih Cabang"
            value={selectedCabang}
            onChange={(value) => setSelectedCabang(value)}
            style={{ width: '100%' }}
            options={filteredCabang.map((item: any) => ({
              key: item.key,
              value: item.id,
              label: item.name,
            }))}
            disabled={isAllCabang || jenisLaporan === 'daftar_penyewa_per_tahun'}
          />
        </Form.Item>

        <Divider />

        {/* Aset Section */}
        <Form.Item label="Aset" name="semua-aset">
          <Checkbox
            checked={isAllAset}
            onChange={(e) => {
              setIsAllAset(e.target.checked);
              if (e.target.checked) {
                setSelectedAset([]); // Clear selected aset if "All-Aset" is checked
              }
            }}
          >
            Pilih Semua Aset
          </Checkbox>
        </Form.Item>

        <Form.Item
          name='aset'
          required={!isAllAset && (jenisLaporan === 'jatuh_tempo' || jenisLaporan === 'daftar_penyewa_per_blok')}
          rules={[
            { required: !isAllAset && (jenisLaporan === 'jatuh_tempo' || jenisLaporan === 'daftar_penyewa_per_blok'), message: 'Aset is required' },
          ]}
        >
          <Select
            disabled={selectedCabang.length === 0 || isAllAset || jenisLaporan === 'daftar_penyewa_per_tahun'}
            mode="multiple"
            placeholder="Pilih Aset"
            value={selectedAset}
            onChange={(value) => setSelectedAset(value)}
            style={{ width: '100%' }}
            options={filteredAset.map((item: any) => ({
              key: item.key,
              value: item.id,
              label: item.name,
            }))}
          />
        </Form.Item>

        <Divider />

        {/* Periode Section */}
        <Form.Item name='periode' label="Periode" rules={[
          {
            required: jenisLaporan === 'daftar_penyewa_per_tahun',
            message: 'Periode is required',
          }
        ]}>
          <DatePicker
            picker={jenisLaporan !== 'transaksi_listrik_bulanan' ? 'year' : 'month'}
            format={jenisLaporan !== 'transaksi_listrik_bulanan' ? 'YYYY' : 'MM-YYYY'}
            disabled={jenisLaporan === 'daftar_penyewa_per_blok'} // Disable DatePicker if jenisLaporan is 'daftar_penyewa_per_blok'
          />
        </Form.Item>

        <Divider />

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Form.Item>
            <Button onClick={() => {
              props.setOpenModal(false);
              props.form.resetFields();
              setFilteredCabang(CABANG_OPTIONS);
              setFilteredAset(ASET_OPTIONS);
              setSelectedCabang([]);
              setSelectedAset([]);
              setIsAllCabang(false);
              setIsAllAset(false);
            }}>Cancel</Button>
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" type="primary" loading={uploading}>
              {uploading ? 'Uploading' : 'Submit'}
            </Button>
          </Form.Item>
        </div>

      </Form>
    </Modal>
  );
}
