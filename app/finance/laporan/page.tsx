'use client'
import React, { useEffect, useState, useRef } from 'react'
import { Button, Table, message, Popconfirm, Spin, Typography, List } from 'antd'
import Title from 'antd/es/typography/Title'
import { useReactToPrint } from 'react-to-print'
import { ReportFiltersModal } from '@/app/components/aruskas/laporan/ReportFiltersModal'
import PrintableReport from '@/app/components/aruskas/laporan/PrintableReport'
import dayjs from 'dayjs'
import { Tooltip } from 'antd';
import CategoryReport from './CategoryReport'
import PeriodReport from './PeriodReport'
import { useSession } from 'next-auth/react';

const { Text } = Typography

export default function Page() {
  const [selectedCabang, setSelectedCabang] = useState<number | null>(null)
  const [cashFlowType, setCashFlowType] = useState<'incoming' | 'outgoing' | 'both'>('both')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [periodType, setPeriodType] = useState<'monthly' | 'yearly'>('monthly')
  const [selectedPeriod, setSelectedPeriod] = useState<any>(null)
  const [configurations, setConfigurations] = useState<any[]>([])
  const [allData, setAllData] = useState<any>()
  const [loading, setLoading] = useState<boolean>(true)
  const [print, setPrint] = useState<boolean>(false)
  const [printedData, setPrintedData] = useState<any>(null)
  const printRef = useRef(null)
  const printRecordRef = useRef<any>(null)
  const { data: session } = useSession()

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onBeforeGetContent: async () => {
      return new Promise<void>((resolve, reject) => {
        try {
          setPrint(true)
          resolve()
        } catch (error) {
          console.error('Error during print preparation:', error)
          reject(error)
        }
      })
    },
    onAfterPrint: () => {
      setPrint(false)
    }
  })

  // Trigger print when printedData and printRef are set
  useEffect(() => {
    if (print && printedData && printRef.current) {
      handlePrint()
    }
  }, [print, printedData])

  // Fetch data on mount
  useEffect(() => {
    getData()
  }, [])

  // Function to fetch configurations
  async function getData() {
    try {
      setLoading(true)
      const response = await fetch('/api/report-filters')
      const data = await response.json()
      if (data) setAllData(data)
    } catch (error) {
      console.error('Error fetching data: ', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle delete action
  async function handleDeleteConfiguration(id: number) {
    try {
      const response = await fetch(`/api/report-filters/${id}`, { method: 'DELETE' })
      const result = await response.json()
      if (result.status === 200) {
        message.success('Configuration deleted successfully')
        getData() // Refresh data after delete
      } else {
        message.error(result.error)
      }
    } catch (error) {
      console.error('Error deleting configuration:', error)
      message.error('Failed to delete configuration.')
    }
  }

  // Handle print action
  const fetchCashFlowDataForPrint = async (record: any) => {
    try {
      let periodStart = '', periodEnd = '';
      const year = dayjs(record.period_date).year();
      const month = dayjs(record.period_date).month() + 1;

      if (record.period_type === 'yearly') {
        periodStart = `${year}-01-01`;
        periodEnd = `${year}-12-31`;
      } else if (record.period_type === 'monthly') {
        const lastDayOfMonth = dayjs(`${year}-${month}`).daysInMonth();
        periodStart = `${year}-${month.toString().padStart(2, '0')}-01`;
        periodEnd = `${year}-${month.toString().padStart(2, '0')}-${lastDayOfMonth}`;
      }

      const payload = {
        cabang_id: record.cabang_id,
        report_type: record.report_type,
        nama_cabang: record.nama_cabang,
        categories: record.categories.map((item: any) => item.split(' - ')[0]),
        period_type: record.period_type,
        period_start: periodStart,
        period_end: periodEnd,
      };

      const response = await fetch('/api/report-filters/fetch-cashflow-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to fetch cash flow data');

      let result = await response.json();
      
      result.report_type = record.report_type;
      result.period_date = record.period_date

      console.log("result --> ", result)
      setPrintedData(result);
      setPrint(true); // Trigger print
    } catch (error: any) {
      message.error(error.message || 'Error fetching cash flow data.');
    }
  };


  const columns = [
    {
      title: 'Cabang',
      dataIndex: 'nama_cabang',
      key: 'nama_cabang',
      render: (nama_cabang: string[]) => (
        <Text strong>{nama_cabang.join(', ')}</Text>
      ),
      width: '20%',
    },
    {
      title: 'Tipe Laporan',
      dataIndex: 'report_type',
      key: 'report_type',
      render: (type: string) => (
        <Text>{type === 'category' ? 'Kategori' : 'Periode'}</Text>
      ),
      width: '15%',
    },
    {
      title: 'Tipe Kas',
      dataIndex: 'cash_flow_type',
      key: 'cash_flow_type',
      render: (type: string) => (
        <Text>{type === 'both' ? 'Kas Masuk dan Keluar' : type.charAt(0).toUpperCase() + type.slice(1)}</Text>
      ),
      width: '15%',
    },
    {
      title: 'Kategori',
      dataIndex: 'categories',
      key: 'categories',
      render: (categories: string[]) => (
        <Tooltip title={categories.join(', ')}>
          {categories.slice(0, 3).join(', ')}
          {categories.length > 3 ? ', ...' : ''}
        </Tooltip>
      ),
    },
    {
      title: 'Periode',
      dataIndex: 'period_type',
      key: 'period_type',
      width: '10%',
    },
    {
      title: 'Tanggal/Tahun Periode',
      dataIndex: 'period_date',
      key: 'period_date',
      width: '10%',
      render: (date: string, record: any) => {
        if (record.period_type === 'monthly') return dayjs(date).format('MMMM YYYY')
        if (record.period_type === 'yearly') return dayjs(date).format('YYYY')
        return date
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button type="link" onClick={() => fetchCashFlowDataForPrint(record)}>Print</Button>
          <Popconfirm
            title="Sure to delete?"
            onConfirm={() => handleDeleteConfiguration(record.id)}
          >
            <Button type="link" danger>Delete</Button>
          </Popconfirm>
        </div>
      ),
      width: '15%',
    }
  ]

  return (
    <>
      <Title level={3}>Laporan Kas</Title>

      {/* Loading State */}
      {loading ? (
        <div style={{ textAlign: 'center' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Report Filters */}
          <ReportFiltersModal
            selectedCabang={selectedCabang}
            setSelectedCabang={setSelectedCabang}
            cashFlowType={cashFlowType}
            setCashFlowType={setCashFlowType}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            periodType={periodType}
            setPeriodType={setPeriodType}
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
            refreshConfigurations={getData}
          />

          {/* Configurations Table */}
          <Table
            bordered
            pagination={{ pageSize: 10 }}
            size="small"
            columns={columns}
            dataSource={allData?.data.map((item: any, index: number) => ({ ...item, key: index + 1 }))}
            rowKey="id"
          />

          {/* Printable Component */}
          <div style={{ display: 'none' }}>
            {printedData && (
                <>
                {printedData?.report_type === 'category' ? (
                  <CategoryReport ref={printRef} user={session?.user?.name || 'Unknown'} printedData={printedData} />              
                ) : (
                  <PeriodReport ref={printRef} user={session?.user?.name || 'Unknown'} printedData={printedData} />
                )}
                </>
            )}
          </div>
        </>
      )}
    </>
  )
}
