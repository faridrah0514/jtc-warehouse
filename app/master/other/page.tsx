'use client'
import React from 'react';
import { Row, Col } from 'antd';
import TipeAsetTable from './TipeAsetTable';
import TipeSertifikatTable from './TipeSertifikatTable';
import CategoryTable from '@/app/components/aruskas/kategori/CategoryTable';

const Page: React.FC = () => {
  return (
    <div className="p-6 bg-gray-100">
      <Row gutter={24}>
        <Col xs={24} md={12}>
          <TipeAsetTable />
        </Col>
        <Col xs={24} md={12}>
          <TipeSertifikatTable />
        </Col>
      </Row>

      {/* Section for Cash Flow Categories */}
      <Row>
        <Col xs={24} md={24}>
          <CategoryTable />
        </Col>
      </Row>
    </div>
  );
};

export default Page;
