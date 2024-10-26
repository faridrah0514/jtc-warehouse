'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button, Collapse, DatePicker, Flex, Form, Modal, Popconfirm, Select, Space, Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { _renderCurrency } from '@/app/utils/renderCurrency';
import AddIPLModal from './AddIPLModal';
import { getTanggalEntriColumn } from '@/app/utils/dateColumns';
import RoleProtected from '@/app/components/roleProtected/RoleProtected';
import { useReactToPrint } from 'react-to-print';
import ReceiptPrint, { ReceiptPrintHandle } from './ReceiptPrint';

import 'dayjs/locale/id';

const { Option } = Select;
const { Text } = Typography;
const { Title } = Typography;

export default function Page() {
  const [ubahModal, setUbahModal] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(true);
  const [items, setItems] = useState<{ key: number, label: string, children: any }[]>([]);
  const printRef = useRef<ReceiptPrintHandle | null>(null);
  const [form] = Form.useForm();

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


  const handlePrint = useReactToPrint({
    content: () => printRef.current?.print() || null,
  });

  const printReceipt = useCallback((record: any) => {
    if (printRef.current) {
      // Set the data first, then trigger print
      printRef.current.setData({
        id_pelanggan: `PL-${record.id_pelanggan.toString().padStart(4, '0')}`,
        periode: record.periode_pembayaran,
        nama_pelanggan: record.nama_pelanggan,
        alamat: record.alamat_pelanggan,
        jumlah: record.ipl,
        terbilang: convertCurrencyToBahasa(record.ipl),
      });

      // Delay calling handlePrint to ensure data is set
      setTimeout(handlePrint, 0);
    }
  }, [handlePrint]);

  async function getData() {
    const response = await fetch('/api/master/transaksi/ipl', { method: 'GET', cache: 'no-store' });
    const data = await response.json();

    if (data) {
      let a: any[] = [];
      Object.keys(data.dataobj).forEach((element, i) => {
        a.push({
          key: i,
          label:
            <Flex gap={'small'} align='flex-start' justify='space-between'>
              <Text>{dayjs(element, 'YYYY-MM').locale('id').format('MMMM YYYY')}</Text>
              <Popconfirm title="sure to delete?"
                onConfirm={async function deleteAset() {
                  const result = await fetch('/api/master/transaksi/ipl', {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      data: { periode_pembayaran: element },
                      requestType: "delete_period",
                    })
                  });
                  if (result.status == 200) setTriggerRefresh(!triggerRefresh);
                }}
              >
                <Button danger type='text' size="small">Delete</Button>
              </Popconfirm>
            </Flex>,
          children: (
            <Table
              pagination={false}
              key={i}
              size='small'
              bordered
              columns={[
                getTanggalEntriColumn(),
                { title: "Nama Cabang", key: "nama_cabang", dataIndex: "nama_cabang" },
                { title: "Nama Aset", key: "nama_aset", dataIndex: "nama_aset" },
                { title: "Nama Pelanggan", key: "nama_pelanggan", dataIndex: "nama_pelanggan" },
                { title: "Tagihan IPL", key: "ipl", dataIndex: "ipl", render: (value) => _renderCurrency(value) },
                {
                  title: "Status Pembayaran",
                  key: "status_pembayaran",
                  dataIndex: "status_pembayaran",
                  render: (value) => <Tag color={value !== 'Lunas' ? 'red' : 'green'}>{value}</Tag>
                },
                { title: "Tanggal Pembayaran", key: "tanggal_pembayaran", dataIndex: "tanggal_pembayaran" },
                {
                  title: "Action",
                  key: "action",
                  render: (_, record: any) => (
                    <Space>
                      <Button
                        type="default"
                        size="small"
                        onClick={() => printReceipt(record)} // Call the printReceipt method
                      >
                        Print
                      </Button>
                      <RoleProtected allowedRoles={['admin', 'supervisor']} actionType='edit' createdAt={record.created_at}>
                        <Button
                          type="primary"
                          ghost
                          size="small"
                          onClick={() => {
                            setUbahModal(true);
                            if (record.tanggal_pembayaran) {
                              record.tanggal_pembayaran = dayjs(record.tanggal_pembayaran, 'DD-MM-YYYY');
                            }
                            form.setFieldsValue(record);
                          }}
                        >
                          Ubah Status Pembayaran
                        </Button>
                      </RoleProtected>
                    </Space>
                  )
                }
              ]}
              dataSource={data.dataobj[element].map((item: any, index: number) => ({ ...item, key: index }))}
            />
          )
        });
      });
      setItems(a);
    }
  }

  useEffect(() => {
    getData();
  }, [triggerRefresh]);

  async function ubahStatusPembayaran(value: any) {
    value.tanggal_pembayaran = value.tanggal_pembayaran.format("DD-MM-YYYY");
    await fetch('/api/master/transaksi/ipl', {
      method: 'POST',
      body: JSON.stringify({
        requestType: 'ubahStatusPembayaran',
        data: value,
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    setUbahModal(false);
    setTriggerRefresh(!triggerRefresh);
  }

  return (
    <>
      <Title level={3}>Halaman Data Master Transaksi - IPL</Title>
      <Flex className='pb-5' gap={'small'} vertical={false}>
        <Button onClick={() => setOpenModal(true)}>+ Buat Tagihan IPL</Button>
      </Flex>
      <Modal open={ubahModal} closeIcon={null} footer={null} title='Form Ubah Status Pembayaran'>
        <Form
          name="addTipeAsetForm"
          onFinish={ubahStatusPembayaran}
          form={form}
          layout='horizontal'
          labelAlign='left'
          labelCol={{ span: 8 }}
        >
          <Form.Item name='id_pelanggan' label='Nama Pelanggan' hidden />
          <Form.Item name='id_cabang' label='Nama Cabang' hidden />
          <Form.Item name='id_aset' label='Nama Aset' hidden />
          <Form.Item name='periode_pembayaran' label='Nama Aset' hidden />
          <div className='pb-5'>
            <Text>Ubah status pembayaran pada Nama Cabang: <strong>{form.getFieldValue("nama_cabang")}</strong>, Nama Aset: <strong>{form.getFieldValue("nama_aset")}</strong> dan Nama Pelanggan: <strong>{form.getFieldValue("nama_pelanggan")}</strong></Text>
          </div>
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
      <AddIPLModal form={form} setOpenModal={setOpenModal} openModal={openModal} triggerRefresh={triggerRefresh} setTriggerRefresh={setTriggerRefresh} />
      <Collapse items={items}></Collapse>
      {/* Hidden component for printing */}
      <div style={{ display: 'none' }}>
        <ReceiptPrint ref={printRef} />
      </div>
    </>
  );
}
