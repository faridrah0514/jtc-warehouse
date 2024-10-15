'use client';
import React from 'react';
import { Card, Col, Row, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { DollarOutlined, LineChartOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function FinanceDashboard() {
  const router = useRouter();

  // Function to handle navigation to child pages
  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div>
      <Title level={2} style={{ marginBottom: '24px' }}>Dashboard Keuangan</Title>
      <div style={{ backgroundColor: '#f0f2f5', padding: '24px', borderRadius: '8px' }}>
        <Row gutter={[24, 24]}>
          {/* Card for Laporan Transaksi */}
          <Col xs={24} md={12}>
            <Card
              title={
                <span style={{ fontWeight: 'bold' }}>
                  <DollarOutlined style={{ marginRight: '8px' }} />
                  Laporan Transaksi
                </span>
              }
              bordered={false}
              hoverable
              className="finance-card"
              onClick={() => handleNavigation('/finance/aruskas')}
            >
              <p>Lihat data rinci dari kas masuk dan keluar</p>
            </Card>
          </Col>

          {/* Card for Laporan Arus Kas */}
          <Col xs={24} md={12}>
            <Card
              title={
                <span style={{ fontWeight: 'bold' }}>
                  <LineChartOutlined style={{ marginRight: '8px' }} />
                  Laporan Arus Kas
                </span>
              }
              bordered={false}
              hoverable
              className="finance-card"
              onClick={() => handleNavigation('/finance/laporan')}
            >
              <p>Laporan kas masuk dan keluar</p>
            </Card>
          </Col>
        </Row>

        <style jsx>{`
          .finance-card {
            background-color: #fff;
            padding: 16px;
            border-radius: 8px;
            transition: box-shadow 0.3s;
          }
          .finance-card:hover {
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            cursor: pointer;
          }
          .finance-card p {
            color: #595959;
          }
        `}</style>
      </div>
    </div>
  );
}
