'use client'
import { Card, Col, Row, Statistic, Table, Tag } from 'antd';
import Title from 'antd/es/typography/Title';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import CashFlowSummary from '@/app/components/aruskas/summary/CashFlowSummary'; // Adjust the import path as necessary

export default function Page() {
  const [allData, setAllData] = useState<any>();
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(false);

  async function getData() {
    const response = await fetch('/api/dashboard', { method: 'GET', cache: 'no-store' });
    const data = await response.json();
    if (data) {
      setAllData(data);
    }
  }

  useEffect(() => {
    getData();
  }, [triggerRefresh]);

  return (
    <div style={{ padding: '24px' }}>
      <Title level={3} style={{ marginBottom: '24px', color: '#1890ff' }}>Data Master</Title>
      <Row gutter={24} style={{ marginBottom: '32px' }}>
        <Col span={8}>
          <Card>
            <Statistic value={allData ? allData.jumlahData[0].jumlahCabang : 0} title="Total Cabang" />
            <div className="pt-2">
              <Link href="/master/cabang" className="detail-link">See detail</Link>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic value={allData ? allData.jumlahData[0].jumlahAset : 0} title="Total Aset" />
            <div className="pt-2">
              <Link href="/master/aset" className="detail-link">See detail</Link>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic value={allData ? allData.jumlahData[0].jumlahPelanggan : 0} title="Total Pelanggan" />
            <div className="pt-2">
              <Link href="/master/pelanggan" className="detail-link">See detail</Link>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={12}>
          <div className="pt-5">
            <Title level={3} style={{ color: '#1890ff' }}>Data Sewa Aset</Title>
          </div>
          <Card style={{ paddingTop: '16px', height: '100%' }} bodyStyle={{ height: '250px' }}>
            <Table
              pagination={false}
              bordered
              size="small"
              columns={[
                { key: 'status', title: 'Status', dataIndex: 'status' },
                { key: 'jumlah', title: 'Jumlah', dataIndex: 'jumlah' },
              ]}
              dataSource={[
                { key: 1, status: <Tag color="success">Aktif</Tag>, jumlah: allData?.jumlahStatusSewa['Aktif'] ?? 0 },
                { key: 2, status: <Tag color="processing">Akan Datang</Tag>, jumlah: allData?.jumlahStatusSewa['Akan Datang'] ?? 0 },
                { key: 3, status: <Tag color="default">Non-Aktif</Tag>, jumlah: allData?.jumlahStatusSewa['Non-Aktif'] ?? 0 },
              ]}
            />
            <div className="pt-5">
              <Link href="/master/aset" className="detail-link">See detail</Link>
            </div>
          </Card>
        </Col>

        <Col span={12}>
          <div className="pt-5">
            <Title level={3} style={{ color: '#1890ff' }}>Ringkasan Arus Kas</Title>
          </div>
          <Card style={{ paddingTop: '16px', height: '100%' }} bodyStyle={{ height: '250px' }}>
            <CashFlowSummary />
          </Card>
        </Col>
      </Row>

      <style jsx>{`
        .pt-2 {
          padding-top: 8px;
        }
        .pt-5 {
          padding-top: 24px;
        }
        .detail-link {
          color: #1890ff;
          transition: color 0.3s;
        }
        .detail-link:hover {
          color: #40a9ff;
          text-decoration: underline;
        }
        .ant-card-body {
          padding: 24px;
        }
        .ant-card {
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </div>
  );
}
