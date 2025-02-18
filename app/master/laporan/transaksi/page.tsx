'use client'
import React, { useEffect, useState, useRef } from 'react'

import { Button, Col, ConfigProvider, Divider, Flex, Form, Modal, Popconfirm, Row, Spin, Table, TableProps, message } from 'antd'
import Title from 'antd/es/typography/Title'
import AddLaporanModal from './AddLaporanModal'
import { useReactToPrint } from 'react-to-print'
import { useSession } from 'next-auth/react'
import dayjs from 'dayjs';
import { Typography } from 'antd';
import { _renderCurrency } from '@/app/utils/renderCurrency'

const { Text } = Typography;

const column = [
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
  const [respData, setRespData] = useState<any>()
  const { data: session, status } = useSession();

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
    onBeforePrint: () => { },
    onAfterPrint: () => {
      setPrint(false)
    }
  })

  useEffect(() => {
    if (respData !== null) {
      handlePrint();
    }
  }, [respData]);

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
    setPrintedColumn(res.columnNames)
    setRespData(res)
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
            pagination={{ pageSize: 100 }}
            size='small'
            columns={[
              ...column,
              {
                title: 'Action',
                key: 'action',
                render: (_, record) => (
                  <>
                    <Flex>
                      <Button type="link" ghost size="small" onClick={() => handleButtonClick(record)}>
                        Print
                      </Button>
                      <Popconfirm
                        title="sure to delete?"
                        onConfirm={async function deleteCabang() {
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
                          if (result.status === 200) {
                            message.success("Delete berhasil")
                          } else {
                            message.error(result.error)
                          }
                        }}
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
          <div ref={componentRef} className="print-only">
            {respData?.map((item: any, idx: number) => {
              // Create dataSource with key for each row
              let dataSourceWithTotal = item.laporan.map((laporanItem: any, index: number) => ({
                ...laporanItem,
                key: index,
              }));

              // Append total row conditionally for both "DAFTAR PENYEWA PER-BLOK" and "DAFTAR PENYEWA PER-TAHUN"
              if (item.jenis_laporan === "DAFTAR PENYEWA PER-BLOK") {
                dataSourceWithTotal = [
                  ...dataSourceWithTotal,
                  {
                    key: "total",
                    nama_cabang: "", // Empty for column merging
                    nama_penyewa: "Total Harga Sewa", // Label for total row
                    harga_sewa: item.total_harga_sewa, // Display total_harga_sewa from response
                  },
                ];
              } else if (item.jenis_laporan === "DAFTAR PENYEWA PER-TAHUN") {
                dataSourceWithTotal = [
                  ...dataSourceWithTotal,
                  {
                    key: "total",
                    nama_penyewa: "Total", // Label for total row
                    harga_sewa: item.totalHargaSewa, // Use totalHargaSewa from backend
                    IPL: item.totalIPL, // Use totalIPL from backend if applicable
                  },
                ];
              } else if (item.jenis_laporan.startsWith("DAFTAR JATUH TEMPO")) {
                dataSourceWithTotal = [
                  ...dataSourceWithTotal,
                  {
                    key: "total",// Empty for column merging
                    nama_penyewa: "Total Harga Sewa", // Label for total row
                    total_harga_sewa: item.total_harga_sewa, // Display total_harga_sewa from response
                  },
                ];
                console.log(dataSourceWithTotal)
              } else if (item.jenis_laporan.startsWith("DATA PEMAKAIAN IPL ")) {
                dataSourceWithTotal = [
                  ...dataSourceWithTotal,
                  {
                    key: "total",
                    nama_cabang: "Total",
                    IPL: item.total,
                  },
                ];
              } else if (!item.jenis_laporan.startsWith("DATA PEMAKAIAN LISTRIK TAHUN") && item.jenis_laporan.startsWith("DATA PEMAKAIAN LISTRIK")) {
                console.log(dataSourceWithTotal)
                dataSourceWithTotal.map((item: any) => {
                  item.kwh_rp_1 = _renderCurrency(item?.kwh_rp, false, false)
                })
                dataSourceWithTotal = [
                  ...dataSourceWithTotal,
                  {
                    key: "total",
                    nama_aset: "Total",
                    total_biaya: item.total,
                    kwh_rp_1: _renderCurrency(item?.kwh_rp, false, false),
                  },
                ];
                console.log(dataSourceWithTotal)
              }

              // Adjust column rendering for merging all except 'harga_sewa' and 'IPL' for the total row
              let columnsWithMerge = item.columnNames.map((col: any) => {
                if (col.dataIndex === "nama_penyewa" || col.dataIndex === "nama_cabang") {
                  return {
                    ...col,
                    render: (text: any, record: any) => {
                      if (record.key === "total") {
                        return {
                          children: (
                            <div style={{ textAlign: "right", fontWeight: "bold" }}>
                              {(item.jenis_laporan === "DAFTAR PENYEWA PER-BLOK" || item.jenis_laporan.startsWith("DAFTAR JATUH TEMPO")) ? "Total Harga Sewa" : "Total"}
                            </div>
                          ),
                          props: {
                            colSpan: (item.jenis_laporan === "DAFTAR PENYEWA PER-BLOK" || item.jenis_laporan.startsWith("DAFTAR JATUH TEMPO") || item.jenis_laporan.startsWith("DATA PEMAKAIAN IPL ") || item.jenis_laporan.startsWith("DATA PEMAKAIAN LISTRIK"))
                              ? item.columnNames.length - 1 // Merge all columns except 'harga_sewa' for DAFTAR PENYEWA PER-BLOK
                              : item.columnNames.length - 2, // Merge all columns except 'harga_sewa' and 'IPL' for DAFTAR PENYEWA PER-TAHUN
                          },
                        };
                      }
                      return text;
                    },
                  };
                }

                if (col.dataIndex !== "harga_sewa" && col.dataIndex !== "IPL") {
                  return {
                    ...col,
                    render: (text: any, record: any) => {
                      if (record.key === "total") {
                        return {
                          props: {
                            colSpan: 0, // Skip merged columns
                          },
                        };
                      }
                      return text;
                    },
                  };
                }

                if (col.dataIndex === "harga_sewa" || col.dataIndex === "IPL") {
                  return {
                    ...col,
                    render: (text: any, record: any) => {
                      if (record.key === "total") {
                        return {
                          children: record[col.dataIndex],
                          props: {
                            colSpan: 1, // Keep this column for totals
                          },
                        };
                      }
                      return text;
                    },
                  };
                }

                return col;
              });

              columnsWithMerge = columnsWithMerge.map((col: any) => {
                if (col.dataIndex === 'harga_sewa' || col.dataIndex === 'IPL' || col.dataIndex === 'total_biaya' || col.dataIndex === 'kwh_rp' || col.dataIndex === 'total_harga_sewa' || col.dataIndex === 'total' ) {
                  return {
                    ...col,
                    render: (text: any, record: any) => {
                      return (
                        <div style={{ textAlign: "right" }}>
                          {record.key === "total" ? record[col.dataIndex] : text}
                        </div>
                      );
                    }
                  };
                }
                return col; // Make sure to return the column if it's not 'harga_sewa' or 'IPL'
              }).map((col: any) => {
                if (col.dataIndex === 'nomor' || col.dataIndex === 'no') {
                  return {
                    ...col,
                    render: (text: any, record: any) => {
                      // Check if the record is not a merged "total" row
                      if (record.key === "total") {
                        return {
                          children: text,
                          props: {
                            colSpan: 0, // Skip the merged column
                          },
                        };
                      }
                      return (
                        <div style={{ textAlign: "center" }}>
                          {text}
                        </div>
                      );
                    },
                  };
                }
                return col;
              })

              const cabang = Array.isArray(item.cabang) ? item.cabang.join(", ") : item.cabang;
              const aset = Array.isArray(item.aset) ? item.aset.join(", ") : item.aset;

              return (
                <>
                  {/* Title */}
                  <div className='print-content print-container' style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'space-between', pageBreakInside: 'avoid' }}>
                    <div>
                      <div>
                        <Title level={4} style={{ textAlign: "left", margin: 0, fontSize: '14px' }}>CV. JAMBI TRADE CENTER</Title>
                        <Title level={4} style={{ textAlign: "left", margin: 0, fontSize: '14px' }}>JAMBI</Title>
                        <br />
                        <Title level={5} style={{ margin: '0 0 -20px 0', fontSize: '16px' }}>{item.jenis_laporan}</Title>
                        {item.jenis_laporan === "DAFTAR PENYEWA PER-TAHUN" && (
                          <Title level={5} style={{ margin: '20px 0 -20px 0', fontSize: '16px' }}>Tahun: {item.periode}</Title>
                        )}
                        {!item.jenis_laporan.startsWith("DAFTAR JATUH TEMPO") && (
                          <Title level={5} style={{ margin: "20px 0", fontSize: '12px' }}>{aset}</Title>
                        )}
                      </div>
                      <div>
                        <Divider className="mb-1 pb-0"></Divider>
                      </div>

                      <Table
                        size="small"
                        bordered
                        columns={columnsWithMerge}
                        dataSource={dataSourceWithTotal}
                        rowKey="key"
                        rowClassName={(record) => (record.key === "total" ? "font-bold" : "")}
                        pagination={false} // Disable pagination for printing purposes
                        style={{ fontSize: '10px' }} // Reduce table font size
                      />
                    </div>
                  </div>

                  {/* Footer with User and Date */}
                  <div className="print-footer">
                    <Text style={{ fontSize: '10px', color: 'grey' }}>{session?.user?.name} - {dayjs().format('DD MMMM YYYY, HH:mm')}</Text>
                  </div>
                  {/* Page break for printing */}
                  <div className="page-break">

                  </div>
                </>
              );
            })}
          </div>

          <style jsx>{`
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
              .print-footer {
                  position: fixed;
                  bottom: 0;
                  left: 0;
                  right: 0;
                  padding: 1px 1px;
                  text-align: right;
                  font-size: 5px;
              }

              .print-only {
                text-align: center;
                display: block;
              }

              .avoid-page-break {
                page-break-inside: avoid;
              }
              .no-print {
                display: none;
              }

              .page-break {
                page-break-after: always;
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

            .grid-container {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 16px;
            }

            .grid-item {
              border: 1px solid #d9d9d9;
              padding: 8px;
              background: #fafafa;
            }
        `}</style>
        </>
      }
    </>
  )
}
