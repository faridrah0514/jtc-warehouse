'use client'
import { Card, Col, Divider, Row, Statistic, Table, Tag } from 'antd';
import Title from 'antd/es/typography/Title';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import CashFlowSummary from '@/app/components/aruskas/summary/CashFlowSummary';

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

      {/* Top Row: Summary Cards */}
      <Row gutter={24} style={{ marginBottom: '32px' }}>
        {[
          { title: 'Total Cabang', value: allData?.jumlahData[0].jumlahCabang ?? 0, link: '/master/cabang' },
          { title: 'Total Aset', value: allData?.jumlahData[0].jumlahAset ?? 0, link: '/master/aset' },
          { title: 'Total Pelanggan', value: allData?.jumlahData[0].jumlahPelanggan ?? 0, link: '/master/pelanggan' },
        ].map((item, index) => (
          <Col span={8} key={index}>
            <Card bordered style={{ borderColor: '#d9d9d9', borderRadius: '8px' }}>
              <Statistic value={item.value} title={item.title} />
              <div className="pt-2">
                <Link href={item.link} className="detail-link">See detail</Link>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Option 1: Classic Grid Layout */}
      <Row gutter={24} align="top" style={{ marginBottom: '32px' }}>
        <Col span={24}>
          <Title level={3} style={{ color: '#1890ff', marginBottom: '16px' }}>Data Sewa Aset</Title>
          <Card
            bordered
            style={{ height: '100%', borderColor: '#d9d9d9', borderRadius: '8px' }}
            bodyStyle={{ padding: '24px', height: '100%' }}
          >
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
      </Row>
      <Row gutter={24} align="top" style={{ marginBottom: '32px' }}>
        <Col span={24}>
        <Title level={3} style={{ color: '#1890ff', marginBottom: '16px' }}>Ringkasan Arus Kas</Title>
          <Card
            bordered
            style={{ height: '100%', borderColor: '#d9d9d9', borderRadius: '8px' }}
            bodyStyle={{ padding: '24px', height: '100%' }}
          >
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
        .ant-card {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .ant-card-body {
          padding: 24px;
        }
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .pt-5, .pt-2 {
            padding-top: 16px;
          }
          .detail-link {
            font-size: 14px;
          }
          .ant-card-body {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
}
