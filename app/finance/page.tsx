'use client';
import React from 'react';
import { Card, Col, Row, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { DollarOutlined, LineChartOutlined } from '@ant-design/icons';
import CashFlowSummary from '../components/aruskas/summary/CashFlowSummary';

const { Title, Text } = Typography;

export default function FinanceDashboard() {
  const router = useRouter();

  // Function to handle navigation to child pages
  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '32px'}}>Dashboard Keuangan</Title>
      <div style={{ backgroundColor: '#f7f9fc', padding: '24px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
        <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
          {/* Card for Laporan Transaksi */}
          <Col xs={24} md={12}>
            <Card
              title={
                <Text strong style={{ fontSize: '16px' }}>
                  <DollarOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                  Laporan Transaksi
                </Text>
              }
              bordered={false}
              hoverable
              className="finance-card"
              onClick={() => handleNavigation('/finance/aruskas')}
            >
              <Text type="secondary">Lihat data rinci dari kas masuk dan keluar</Text>
            </Card>
          </Col>

          {/* Card for Laporan Arus Kas */}
          <Col xs={24} md={12}>
            <Card
              title={
                <Text strong style={{ fontSize: '16px' }}>
                  <LineChartOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                  Laporan Arus Kas
                </Text>
              }
              bordered={false}
              hoverable
              className="finance-card"
              onClick={() => handleNavigation('/finance/laporan')}
            >
              <Text type="secondary">Laporan kas masuk dan keluar</Text>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <CashFlowSummary />
          </Col>
        </Row>
        <style jsx>{`
          .finance-card {
            background-color: #ffffff;
            padding: 20px;
            border-radius: 10px;
            transition: box-shadow 0.3s, transform 0.3s;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }
          .finance-card:hover {
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
            transform: translateY(-4px);
            cursor: pointer;
          }
          .finance-card p {
            color: #595959;
            font-size: 14px;
          }
          .finance-card-title {
            color: #52c41a;
          }
          .finance-container {
            background-color: #f0f2f5;
            padding: 24px;
            border-radius: 8px;
          }
        `}</style>
      </div>
    </div>
  );
}
