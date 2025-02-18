'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button, ConfigProvider, DatePicker, Flex, Form, message, Modal, Popconfirm, Select, Spin, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);
import Link from 'next/link';
import AddListrikModalV2 from './AddListrikModalV2';
import { getTanggalEntriColumn } from '@/app/utils/dateColumns';
import RoleProtected from '@/app/components/roleProtected/RoleProtected';
import ReceiptPrint, { ReceiptPrintHandle } from './ReceiptPrint';
import { useReactToPrint } from 'react-to-print';
import Title from 'antd/es/typography/Title';
import 'dayjs/locale/id';

const { Option } = Select;

const column = [
  getTanggalEntriColumn(),
  { title: "Bln/Thn", dataIndex: 'bln_thn', key: 'bln_thn' },
  { title: "Meteran Awal", dataIndex: 'meteran_awal', key: 'meteran_awal' },
  { title: "Meteran Akhir", dataIndex: 'meteran_akhir', key: 'meteran_akhir' },
  {
    title: "Status Pembayaran",
    key: "status_pembayaran",
    dataIndex: "status_pembayaran",
    render: (value: any) => <Tag color={value !== 'Lunas' ? 'red' : 'green'}>{value}</Tag>
  },
  { title: "Tanggal Pembayaran", key: "tanggal_pembayaran", dataIndex: "tanggal_pembayaran" },
];

const columnSewa = [
  { title: "Nomor", dataIndex: 'no', key: 'no' },
  { title: "Cabang", dataIndex: 'nama_cabang', key: 'nama_cabang' },
  { title: "Aset", dataIndex: 'nama_aset', key: 'nama_aset' },
  { title: "Pelanggan", dataIndex: 'nama_pelanggan', key: 'nama_pelanggan' },
  { title: "Tanggal Awal Sewa", dataIndex: 'start_date_sewa', key: 'start_date_sewa' },
  { title: "Tanggal Akhir Sewa", dataIndex: 'end_date_sewa', key: 'end_date_sewa' },

];

export default function Page() {
  const [tagihanListrikData, setTagihanListrik] = useState<any[]>([]);
  const [subTagihanListrikData, setSubTagihanListrik] = useState<any[]>([]);
  // const [] = useState<any[]>([]);
  const [dataSewa, setDataSewa] = useState<any[]>([]);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [ubahModal, setUbahModal] = useState<boolean>(false);
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(true);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [formUbah] = Form.useForm();
  const [loading, setLoading] = useState(true);

  const printRef = useRef<ReceiptPrintHandle | null>(null);
  const handlePrint = useReactToPrint({
    content: () => printRef.current?.print() || null,
  });
  function numberToBahasaWords(number: number): string {
    const satuan = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];

    if (number < 12) {
      return satuan[number];
    } else if (number < 20) {
      return satuan[number - 10] + " belas";
    } else if (number < 100) {
      return satuan[Math.floor(number / 10)] + " puluh " + satuan[number % 10];
    } else if (number < 200) {
      return "seratus " + numberToBahasaWords(number - 100);
    } else if (number < 1000) {
      return satuan[Math.floor(number / 100)] + " ratus " + numberToBahasaWords(number % 100);
    } else if (number < 2000) {
      return "seribu " + numberToBahasaWords(number - 1000);
    } else if (number < 1000000) {
      return numberToBahasaWords(Math.floor(number / 1000)) + " ribu " + numberToBahasaWords(number % 1000);
    } else if (number < 1000000000) {
      return numberToBahasaWords(Math.floor(number / 1000000)) + " juta " + numberToBahasaWords(number % 1000000);
    } else if (number < 1000000000000) {
      return numberToBahasaWords(Math.floor(number / 1000000000)) + " miliar " + numberToBahasaWords(number % 1000000000);
    } else {
      return "Nominal terlalu besar";
    }
  }

  function capitalizeFirstLetter(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function convertCurrencyToBahasa(input: string | number): string {
    // Remove dots from string input and convert it to a number
    const number = typeof input === "string" ? parseInt(input.replace(/\./g, ""), 10) : input;

    // Round the number for Indonesian currency formatting
    const roundedNumber = Math.round(number);
    const words = numberToBahasaWords(roundedNumber) + " rupiah";
    return capitalizeFirstLetter(words);
  }

  const printReceipt = useCallback((transactionRecord: any) => {
    const record = {
      id_pelanggan: `PL-${transactionRecord.id_pelanggan.toString().padStart(4, '0')}`,
      periode: dayjs(transactionRecord.bln_thn, 'MM-YYYY').locale('id').format('MMMM YYYY'),
      nama_pelanggan: transactionRecord.nama_pelanggan,
      alamat: transactionRecord.alamat,
      tagihan: Math.round((transactionRecord.meteran_akhir - transactionRecord.meteran_awal) * transactionRecord.kwh_rp),
      terbilang: convertCurrencyToBahasa(Math.round((transactionRecord.meteran_akhir - transactionRecord.meteran_awal) * transactionRecord.kwh_rp)),
    }
    // Set the data on printRef
    printRef.current?.setData(record);

    // Delay the print to ensure data has been updated
    setTimeout(() => {
      handlePrint();
    }, 100); // 100ms delay to allow data update
  }, [handlePrint]);

  async function getData() {
    const response = await fetch('/api/master/transaksi/listrik', { method: 'GET', cache: 'no-store' });
    const sewa = await fetch('/api/master/transaksi/sewa', { method: 'GET', cache: 'no-store' });
    const dataSewa = await sewa.json();
    const data = await response.json();

    if (data) {
      data.data.forEach((v: any, i: number) => {
        v.no = i + 1;
      });
      setTagihanListrik(data.data);
    }

    if (dataSewa) {
      const today = dayjs();
      dataSewa.data.forEach((v: any, i: number) => {
        v.no = i + 1;
        v.statusSewa = dayjs(v.start_date_sewa, "DD-MM-YYYY") > today
          ? 'Akan Datang'
          : dayjs(v.end_date_sewa, "DD-MM-YYYY") >= today
            ? 'Aktif'
            : 'Non-Aktif';
      });
      setDataSewa(dataSewa.data.filter((value: any) => value.is_pln === 0 && value.statusSewa === 'Aktif'));
      setLoading(false);
    }
  }

  async function ubahStatusPembayaran(value: any) {
    const requestType = 'ubahStatusPembayaran'
    value.tanggal_pembayaran = (value.status_pembayaran == 'Lunas') ? value.tanggal_pembayaran.format("DD-MM-YYYY") : ''
    fetch('/api/master/transaksi/listrik', {
      method: 'POST',
      body: JSON.stringify({
        requestType: requestType,
        data: value
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((res) => res.json())
      .then((res) => {
        if (res.status === 200) {
          message.success('Status pembayaran berhasil diubah');
        } else {
          message.error('Status pembayaran gagal diubah');
        }
      })
      .catch((err) => {
        message.error('Status pembayaran gagal diubah');
      }).finally(() => {
        setUbahModal(false);
        formUbah.resetFields();
        setTriggerRefresh(!triggerRefresh);
      })
  }

  useEffect(() => {
    getData();
  }, [triggerRefresh]);

  return (
    <>

      <Title level={3}>Halaman Data Master Transaksi - Listrik</Title>
      <Modal open={ubahModal} closeIcon={null} footer={null} title='Form Ubah Status Pembayaran'>
        <Form
          name="addTipeAsetForm"
          onFinish={ubahStatusPembayaran}
          form={formUbah}
          layout='horizontal'
          labelAlign='left'
          labelCol={{ span: 8 }}
        >
          <Form.Item name='id' label='id' />
          <Form.Item name='status_pembayaran' label="Status Pembayaran">
            <Select placeholder="Status Pembayaran" allowClear>
              <Option value='Lunas'>Lunas</Option>
              <Option value='Belum Lunas'>Belum Lunas</Option>
            </Select>
          </Form.Item>
          <Form.Item name='tanggal_pembayaran' label="Tanggal Pembayaran">
            <DatePicker format={'DD-MM-YYYY'} />
          </Form.Item>
          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={() => setUbahModal(false)}>Cancel</Button>
            <Button htmlType="submit" type="primary">Submit</Button>
          </div>
        </Form>
      </Modal>
      <AddListrikModalV2 form={form} isEdit={isEdit} setOpenModal={setOpenModal} openModal={openModal} triggerRefresh={triggerRefresh} setTriggerRefresh={setTriggerRefresh} tagihanListrik={subTagihanListrikData} />
      {(loading) ?
        <div className="flex justify-center items-center">
          <Spin size="large" />
        </div>
        :
        <Table
          className='overflow-auto'
          size='small'
          columns={[
            ...columnSewa,
            {
              title: "Status Sewa",
              key: "status_sewa",
              render: (_, record: any) => (
                <Tag color={record.statusSewa === 'Aktif' ? 'success' : record.statusSewa === 'Akan Datang' ? 'processing' : 'default'}>
                  {record.statusSewa}
                </Tag>
              ),
            },
            {
              title: "Action",
              key: "action",
              render: (_, record: any) => (
                <Flex gap="small">
                  <Button
                    type="primary"
                    ghost
                    size="small"
                    disabled={record.statusSewa !== 'Aktif'}
                    onClick={() => {
                      setOpenModal(true);
                      setIsEdit(false);
                      const relatedData = tagihanListrikData.filter((v: any) => (
                        v.id_aset === record.id_aset && v.id_cabang === record.id_cabang && v.id_pelanggan === record.id_pelanggan 
                        ));

                      setSubTagihanListrik(relatedData)
                      form.setFieldsValue(record);
                      setTriggerRefresh(!triggerRefresh);
                    }}
                  >
                    + Tagihan Listrik
                  </Button>
                  <Button
                  type="default"
                  size="small"
                  onClick={() => {
                    const relatedData = tagihanListrikData.filter((v: any) => (
                    v.id_aset === record.id_aset && v.id_cabang === record.id_cabang && v.id_pelanggan === record.id_pelanggan 
                    && dayjs(v.bln_thn, 'MM-YYYY').isBetween(dayjs(record.start_date_sewa, 'DD-MM-YYYY'), dayjs(record.end_date_sewa, 'DD-MM-YYYY'), 'month', '[]')
                    ));

                    relatedData.forEach((data: any) => {
                      data.start_date_sewa = record.start_date_sewa;
                      data.end_date_sewa = record.end_date_sewa;
                    });
                  }}
                  >
                  Get Data
                  </Button>
                </Flex>
              ),
            },
          ]}
          dataSource={dataSewa.map((item: any, index: number) => ({ ...item, key: index }))}
          expandable={{
            expandedRowRender: (record) => (
              <Table
                size='small'
                columns={[
                  ...column,
                  {
                    title: "Action",
                    key: "action",
                    render: (_, transactionRecord: any) => (
                      <Flex gap="small">
                        <Button
                          type="default"
                          size="small"
                          onClick={() => printReceipt(transactionRecord)}
                        >
                          Print
                        </Button>
                        {/* <ConfigProvider
                          theme={{
                            components: {
                              Button: { colorPrimary: '#00b96b', colorPrimaryHover: '#00db7f' },
                            },
                          }}
                        >
                          <Button type="primary" ghost size="small">
                            <Link href={`/master/transaksi/listrik/view/${transactionRecord.id}`}>View</Link>
                          </Button>
                        </ConfigProvider> */}
                          <Button
                            type="primary"
                            ghost
                            size="small"
                            onClick={() => {
                              setUbahModal(true);
                              formUbah.setFieldValue('id', transactionRecord.id)
                            }}
                          >
                            Ubah Status Pembayaran
                          </Button>
                        <RoleProtected allowedRoles={['admin', 'supervisor']} actionType='edit' createdAt={transactionRecord.created_at}>
                          <Button
                            type="primary"
                            ghost
                            size="small"
                            onClick={() => {
                              setOpenModal(true);
                              setIsEdit(true);
                              transactionRecord.bln_thn = dayjs(transactionRecord.bln_thn, 'MM-YYYY');
                              form.setFieldsValue(transactionRecord);
                              setTriggerRefresh(!triggerRefresh);
                            }}
                          >
                            Edit
                          </Button>
                        </RoleProtected>

                        <RoleProtected allowedRoles={['admin']} actionType='delete'>
                          <Popconfirm
                            title="sure to delete?"
                            onConfirm={async () => {
                              const result = await fetch('/api/master/transaksi/listrik', {
                                method: "POST",
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ requestType: 'delete', data: { id: transactionRecord.id } }),
                              });
                              if (result.status === 200) {
                                setTriggerRefresh(!triggerRefresh);
                              }
                            }}
                          >
                            <Button size="small" danger>Delete</Button>
                          </Popconfirm>
                        </RoleProtected>
                      </Flex>
                    ),
                  },
                ]}
                dataSource={tagihanListrikData.filter((v: any) => (
                  v.id_aset === record.id_aset && v.id_cabang === record.id_cabang && v.id_pelanggan === record.id_pelanggan 
                  // && dayjs(v.bln_thn, 'MM-YYYY').isBetween(dayjs(record.start_date_sewa, 'DD-MM-YYYY'), dayjs(record.end_date_sewa, 'DD-MM-YYYY'), 'month', '[]')
                  && v.id_sewa === record.id
                )).map((item: any, index: number) => ({ ...item, key: index }))}
                pagination={false}
              />
            ),
          }}
        />
      }

      {/* Hidden component for printing */}
      <div style={{ display: 'none' }}>
        <ReceiptPrint ref={printRef} />
      </div>
    </>
  );
}
