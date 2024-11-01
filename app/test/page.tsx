'use client'
import { Card, Col, Row, Statistic, Table, Tag, Button } from 'antd';
import { DollarCircleOutlined, ShopOutlined, UserOutlined } from '@ant-design/icons';
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
      <Title level={2} style={{ marginBottom: '24px', color: '#0a0a0a' }}>Dashboard</Title>
      
      <Row gutter={24} style={{ marginBottom: '32px' }}>
        <Col span={8}>
          <Card
            style={{ backgroundColor: '#1890ff', color: '#ffffff', borderRadius: '8px', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }}
            bordered={false}
          >
            <Statistic
              title="Total Cabang"
              value={allData ? allData.jumlahData[0].jumlahCabang : 0}
              valueStyle={{ color: '#ffffff', fontSize: '24px' }}
              prefix={<ShopOutlined style={{ fontSize: '32px', color: '#ffffff' }} />}
            />
            <Link href="/master/cabang">
              <Button type="link" style={{ color: '#ffffff', padding: 0, marginTop: '8px' }}>See detail</Button>
            </Link>
          </Card>
        </Col>

        <Col span={8}>
          <Card
            style={{ backgroundColor: '#faad14', color: '#ffffff', borderRadius: '8px', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }}
            bordered={false}
          >
            <Statistic
              title="Total Aset"
              value={allData ? allData.jumlahData[0].jumlahAset : 0}
              valueStyle={{ color: '#ffffff', fontSize: '24px' }}
              prefix={<DollarCircleOutlined style={{ fontSize: '32px', color: '#ffffff' }} />}
            />
            <Link href="/master/aset">
              <Button type="link" style={{ color: '#ffffff', padding: 0, marginTop: '8px' }}>See detail</Button>
            </Link>
          </Card>
        </Col>

        <Col span={8}>
          <Card
            style={{ backgroundColor: '#f5222d', color: '#ffffff', borderRadius: '8px', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }}
            bordered={false}
          >
            <Statistic
              title="Total Pelanggan"
              value={allData ? allData.jumlahData[0].jumlahPelanggan : 0}
              valueStyle={{ color: '#ffffff', fontSize: '24px' }}
              prefix={<UserOutlined style={{ fontSize: '32px', color: '#ffffff' }} />}
            />
            <Link href="/master/pelanggan">
              <Button type="link" style={{ color: '#ffffff', padding: 0, marginTop: '8px' }}>See detail</Button>
            </Link>
          </Card>
        </Col>
      </Row>

      <Row gutter={24} style={{ marginBottom: '32px' }}>
        <Col span={12}>
          <Title level={3} style={{ color: '#1890ff' }}>Data Sewa Aset</Title>
          <Card style={{ borderRadius: '8px', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }} bordered={false}>
            <Table
              pagination={false}
              bordered={false}
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
            <Link href="/master/aset">
              <Button type="link" style={{ marginTop: '16px' }}>See detail</Button>
            </Link>
          </Card>
        </Col>

        <Col span={12}>
          <Title level={3} style={{ color: '#1890ff' }}>Ringkasan Arus Kas</Title>
          <Card style={{ borderRadius: '8px', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }} bordered={false}>
            <CashFlowSummary />
          </Card>
        </Col>
      </Row>

      <style jsx>{`
        .pt-5 {
          padding-top: 24px;
        }
        .ant-card {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}
