'use client'
import React from 'react';
import { Row, Col } from 'antd';
import CategoryTable from '../../components/aruskas/kategori/CategoryTable';

const Page: React.FC = () => {
  return (
    <div className="p-6 bg-gray-100">
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
