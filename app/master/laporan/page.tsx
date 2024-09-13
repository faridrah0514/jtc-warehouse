'use client'
import React, { useEffect, useState, useRef } from 'react'

import { Button, ConfigProvider, Divider, Flex, Form, Modal, Popconfirm, Spin, Table, TableProps, message } from 'antd'
import Title from 'antd/es/typography/Title'
import AddLaporanModal from './AddLaporanModal'
import { useReactToPrint } from 'react-to-print'

const column = [
  // { title: "TEST", },
  { title: "Nomor", dataIndex: 'key', key: 'no' },
  { title: "Laporan", dataIndex: 'jenis_laporan', key: 'jenis_laporan' },
  { title: "Nama Cabang", dataIndex: 'nama_cabang', key: 'nama_cabang' },
  { title: "Nama Aset", dataIndex: 'nama_aset', key: 'nama_aset' },
  { title: "Periode", dataIndex: 'periode', key: 'periode' },
]

export default function Page() {

  const [form] = Form.useForm()
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(true);
  const [allData, setAllData] = useState<any>();
  const [loading, setloading] = useState(true);
  const [print, setPrint] = useState<boolean>(false)
  const [printedColumn, setPrintedColumn] = useState<any>()
  const [printedData, setPrintedData] = useState<any>(undefined)
  const [variable, setVariable] = useState<any>(null)
  const componentRef = useRef(null)
  const [asetData, setAsetData] = useState<string>('')
  const [cabangData, setCabangData] = useState<string>('')
  const [jenisLaporan, setJenisLaporan] = useState<string>('')

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onBeforeGetContent: async () => {
      return new Promise<void>(async (resolve, reject) => {
        try {
          setPrint(true);
          resolve();
        } catch (error) {
          console.error("Error during print preparation:", error);
          reject(error);
        }
      });
    },
    onBeforePrint: () => {

    },
    onAfterPrint: () => {
      setPrint(false)
    }
  })

  useEffect(() => {
    if (variable !== null && printedData !== null && printedColumn !== null) {
      handlePrint();
    }
  }, [printedColumn]);

  async function handleButtonClick(value: any) {
    setVariable(value);
    const response = await fetch('/api/master/laporan', {
      method: 'POST',
      body: JSON.stringify({
        requestType: 'call-to-print',
        data: value
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const res = await response.json();
    setPrintedData(res.laporan);
    setCabangData(res.cabang);
    setAsetData(res.aset);
    setJenisLaporan(res.jenis_laporan)
    // setPrintedColumn(
    //   res.columnNames.map((val: any, idx: number) => {
    //     return { title: val.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' '), dataIndex: val, key: val };
    //   })
    // );
    setPrintedColumn(
      res.columnNames
    )
  }

  async function getData() {
    try {
      const fetchData = await fetch('/api/master/laporan', { method: 'GET' })
      const data = await fetchData.json()
      if (data) {
        setAllData(data)
      }
    } catch (error) {
      console.error("Error fetching data: ", error)
    } finally {
      setloading(false)
    }
  }

  useEffect(
    () => {
      getData()
    }, [triggerRefresh]
  )

  // Function to apply custom row class
//   const rowClassName = (record: any) => {
//     return record.rowHead === 'Total Tagihan' ? 'bold-row' : '';
//   };

//   // Define CSS style for bold row
//   const styles = `
//   .bold-row {
//     font-weight: bold;
//   }
// `;
  return (
    <>
      <Title level={3}>Halaman Laporan</Title>
      {(loading) ?
        <div className="flex justify-center items-center">
          <Spin size="large" />
        </div>
        : <>
          <Button className="mb-5" onClick={() => { setOpenModal(true) }}>Buat Laporan</Button>
          <AddLaporanModal data={allData} form={form} setOpenModal={setOpenModal} openModal={openModal} triggerRefresh={triggerRefresh} setTriggerRefresh={setTriggerRefresh} />
          <Table
            size='small'
            columns={[
              ...column,
              {
                title: 'Action',
                key: 'action',
                render: (_, record) => (
                  <>
                    <Flex>
                      <Button type="link" ghost size="small" onClick={
                        () => {
                          handleButtonClick(record)
                        }
                      }>
                        Print
                      </Button>
                      <Popconfirm
                        title="sure to delete?"
                        onConfirm={
                          async function deleteCabang() {
                            const result = await (await fetch('/api/master/laporan', {
                              method: "POST",
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                data: { id: record.id },
                                requestType: 'delete_laporan'
                              })
                            })).json()
                            setTriggerRefresh(!triggerRefresh)
                            if (result.status == 200) {
                              message.success("Delete berhasil")
                            } else {
                              message.error(result.error)
                            }
                          }
                        }
                      >
                        <Button size="small" danger>
                          Delete
                        </Button>
                      </Popconfirm>
                    </Flex>
                  </>
                )
              }
            ]} dataSource={allData.laporanData?.map((item: any, index: number) => ({ ...item, key: index + 1 }))}></Table>
          <div ref={componentRef} className='print-only'>
            <div>
              <Title level={3} style={{ margin: 0 }}>CV. JAMBI TRADE CENTER</Title>
              <Title level={3} style={{ margin: 0 }}>JAMBI</Title>
              <br></br>
              <Title level={4} style={{ margin: 0 }}>{jenisLaporan}</Title>
            </div>
            <div>
              <Flex justify='space-between' className='mb-0'>
                <Title level={5} style={{ margin: 0 }}>A/N: {cabangData}</Title>
                <Title level={5} style={{ margin: 0 }}>{asetData}</Title>
              </Flex>
            </div>
            <div>
              <Divider className='mb-1 pb-0'></Divider>
            </div>
            <Table size='small' 
            bordered columns={printedColumn} 
            dataSource={printedData?.map((item: any, index: number) => ({ ...item, key: index }))} 
            rowKey="rowHead"
            rowClassName={(record) => record.rowHead === 'Total Tagihan' ? 'font-bold' : ''}
            />
          </div>
          <style jsx global>{`
            .print-only {
              display: none;
            }

            .no-print {
              display: block;
            }

            .print-table-container {
              display: block;
              width: 100%;
              overflow-x: auto;
            }

            @media print {
              @page {
                size: landscape;
                margin: 5mm;
              }

              .print-only {
                text-align: center;
                display: block;
              }

              .no-print {
                display: none;
              }

              .print-table-container {
                display: block;
                margin: 0 auto;
                width: auto;
                max-width: 100%;
              }

              .ant-table-pagination {
                display: none !important;
              }
            }
        `}</style>
        </>}
    </>

  )
}
