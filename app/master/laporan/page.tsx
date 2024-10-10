'use client';
import React from 'react';
import { Card, Col, Row, Typography } from 'antd';
import { useRouter } from 'next/navigation';

const { Title } = Typography;

export default function Page() {
  const router = useRouter();

  // Function to handle navigation to child pages
  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div>
      <Title level={3} style={{ marginBottom: '16px' }}>Laporan</Title>
      <div style={{ backgroundColor: '#f0f2f5', padding: '24px' }}>
        {/* <Title level={3} style={{ marginBottom: '16px' }}>Laporan</Title> */}
        <Row gutter={[24, 24]}>
          {/* Card for Laporan Transaksi */}
          <Col xs={24} md={12}>
            <Card
              title={<span style={{ fontWeight: 'bold' }}>Laporan Transaksi</span>}
              bordered={false}
              hoverable
              className="card"
              onClick={() => handleNavigation('/master/laporan/transaksi')}
            >
              <p>View detailed reports of transactions including sewa, listrik, and IPL.</p>
            </Card>
          </Col>

          {/* Card for Laporan Arus Kas */}
          <Col xs={24} md={12}>
            <Card
              title={<span style={{ fontWeight: 'bold' }}>Laporan Arus Kas</span>}
              bordered={false}
              hoverable
              className="card"
              onClick={() => handleNavigation('/master/laporan/aruskas')}
            >
              <p>Analyze cash flow reports including incoming and outgoing cash flows.</p>
            </Card>
          </Col>
        </Row>

        <style jsx>{`
        .card {
          background-color: #fff;
          padding: 16px;
          border-radius: 8px;
          transition: box-shadow 0.3s;
        }
        .card:hover {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          cursor: pointer;
        }
        .card p {
          color: #595959;
        }
      `}</style>
      </div>
    </div>

  );
}
