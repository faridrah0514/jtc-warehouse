'use client'
import { Card, Col, Row, Statistic, Table, Tag } from 'antd'
import Title from 'antd/es/typography/Title'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
export default function Page() {
  const [allData, setAllData] = useState<any>()
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(false)

  async function getData() {
    const response = await fetch('/api/dashboard', { method: 'GET', cache: 'no-store' })
    const data = await response.json()
    if (data) {
      setAllData(data)
    }
  }

  useEffect(
    () => {
      getData()
    }, [triggerRefresh]
  )
  return (
    <>
      <Title level={3}>Data Master</Title>
      <Row gutter={24}>
        <Col span={8}>
          <Card>
            <Statistic value={(allData) ? allData.jumlahData[0].jumlahCabang : 0} title='Total Cabang'></Statistic>
            <div className={'pt-2'}>
              <Link href={'/master/cabang'}>See detail</Link>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic value={(allData) ? allData.jumlahData[0].jumlahAset : 0} title='Total Aset'></Statistic>
            <div className={'pt-2'}>
              <Link href={'/master/aset'}>See detail</Link>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic value={(allData) ? allData.jumlahData[0].jumlahPelanggan : 0} title='Total Pelanggan' className=''></Statistic>
            <div className={'pt-2'}>
              <Link href={'/master/pelanggan'}>See detail</Link>
            </div>
          </Card>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col span={12}>
          <div className='pt-5'>
            <Title level={3}>Data Sewa Aset</Title>
          </div>
          <Card>
            <Table
              pagination={false}
              bordered
              size='small'
              columns={[
                { key: 'status', title: 'Status', dataIndex: 'status' },
                { key: 'jumlah', title: 'Jumlah', dataIndex: 'jumlah' },
              ]}
              dataSource={[
                { key: 1, status: <Tag color='success'>Aktif</Tag>, jumlah: allData?.jumlahStatusSewa['Aktif'] ?? 0 },
                { key: 2, status: <Tag color='processing'>Akan Datang</Tag>, jumlah: allData?.jumlahStatusSewa['Akan Datang'] ?? 0 },
                { key: 3, status: <Tag color='default'>Non-Aktif</Tag>, jumlah: allData?.jumlahStatusSewa['Non-Aktif'] ?? 0 },
              ]}
            />
            <div className={'pt-5'}>
              <Link href={'/master/aset'}>See detail</Link>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          {/* <div className='pt-5'>
            <Title level={3}>Data xx</Title>
          </div>
          <Card>
            <Table
              pagination={false}
              bordered
              size='small'
              // columns={[
              //   { key: 'status', title: 'Status', dataIndex: 'status' },
              //   { key: 'jumlah', title: 'Jumlah', dataIndex: 'jumlah' },
              // ]}
              // dataSource={[
              //   { key: 1, status: <Tag color='success'>Aktif</Tag>, jumlah: allData?.jumlahStatusSewa['Aktif'] ?? 0 },
              //   { key: 2, status: <Tag color='processing'>Akan Datang</Tag>, jumlah: allData?.jumlahStatusSewa['Akan Datang'] ?? 0 },
              //   { key: 3, status: <Tag color='default'>Non-Aktif</Tag>, jumlah: allData?.jumlahStatusSewa['Non-Aktif'] ?? 0 },
              // ]}
            />
            <div className={'pt-5'}>
              <Link href={''}>See detail</Link>
            </div>
          </Card> */}
        </Col>
      </Row>
    </>
  )
}
