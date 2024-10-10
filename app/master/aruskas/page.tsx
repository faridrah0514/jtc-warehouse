'use client';

import React, { useEffect, useState } from 'react';
import { Row, Col, Button, message } from 'antd';
import CashFlowTable from './CashFlowTable';
import AddCashFlowModal from './AddCashFlowModal';
import AddCategoryModal from './AddCategoryModal';
import { useFetchCashFlow } from './useFetchCashFlow';
import { useFetchCategories } from './useFetchCategories';
import { CashFlow, CashFlowCategory } from '../../types/master';
import { useFetchCabang } from './useFetchCabang';
// import { Cabang } from '../../types/master'; // Import Cabang type if needed

const Page: React.FC = () => {
  const [isCashFlowModalVisible, setIsCashFlowModalVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [cashFlowType, setCashFlowType] = useState<'incoming' | 'outgoing'>('incoming');
  const [editingData, setEditingData] = useState<CashFlow | null>(null); // Correct type with `CashFlow`

  const { data: incomingData, loading: incomingLoading, fetchCashFlow: fetchIncomingCashFlow, deleteCashFlow: deleteIncomingCashFlow } = useFetchCashFlow('incoming');
  const { data: outgoingData, loading: outgoingLoading, fetchCashFlow: fetchOutgoingCashFlow, deleteCashFlow: deleteOutgoingCashFlow } = useFetchCashFlow('outgoing');
  const { cabang } = useFetchCabang(); // Fetch cabang data
  const { categories, fetchCategories, addCategory } = useFetchCategories();

  useEffect(() => {
    fetchIncomingCashFlow();
    fetchOutgoingCashFlow();
    fetchCategories();
  }, []);

  const showAddCashFlowModal = (type: 'incoming' | 'outgoing') => {
    setCashFlowType(type);
    setEditingData(null); // Clear editing data when adding
    setIsCashFlowModalVisible(true);
  };

  const showEditCashFlowModal = (record: CashFlow) => {
    setEditingData({
      id: record.id, // Include `id`
      category_id: record.category_id,
      cabang_id: record.cabang_id,
      description: record.description,
      amount: record.amount.toString(), // Convert to string if needed
      date: record.date,
      nama_perusahaan: record.nama_perusahaan // Proper format for `dayjs`
    });
    setIsCashFlowModalVisible(true);
  };

  const showAddCategoryModal = () => {
    setIsCategoryModalVisible(true);
  };

  const handleCancelCashFlowModal = () => {
    setIsCashFlowModalVisible(false);
  };

  const handleCancelCategoryModal = () => {
    setIsCategoryModalVisible(false);
  };

  const handleAddOrEditCashFlow = async (values: Omit<CashFlow, 'id'>) => {
    try {
      const method = editingData ? 'PUT' : 'POST'; // Use PUT for editing, POST for adding
      const endpoint = `/api/finance/cashflow/${cashFlowType}`;

      // Include the `id` when editing
      const dataToSend = editingData ? { ...values, id: editingData.id } : values;

      const response = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
      const result = await response.json();

      if (response.ok && result.status === 200) {
        message.success(result.message);
        if (cashFlowType === 'incoming') {
          fetchIncomingCashFlow();
        } else {
          fetchOutgoingCashFlow();
        }
        setIsCashFlowModalVisible(false);
      } else {
        throw new Error(result.message || 'Failed to save cash flow record');
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to save cash flow record');
    }
  };

  const handleAddCategory = async (category: Omit<CashFlowCategory, 'id'>) => {
    try {
      await addCategory(category);
      setIsCategoryModalVisible(false);
      fetchCategories(); // Refresh category list
    } catch (error: any) {
      message.error(error.message || 'Failed to add category');
    }
  };

  return (
    <div className="p-6 bg-gray-100">
      <Row gutter={24}>
        <Col xs={24} md={12}>
          <CashFlowTable
            data={incomingData}
            categories={categories}
            loading={incomingLoading}
            currentPage={1}
            onPageChange={() => { }}
            onDelete={deleteIncomingCashFlow}
            onEdit={showEditCashFlowModal} // Pass edit handler
            onAdd={() => showAddCashFlowModal('incoming')}
            title="Incoming Cash Flow"
          />
        </Col>
        <Col xs={24} md={12}>
          <CashFlowTable
            data={outgoingData}
            categories={categories}
            loading={outgoingLoading}
            currentPage={1}
            onPageChange={() => { }}
            onDelete={deleteOutgoingCashFlow}
            onEdit={showEditCashFlowModal} // Pass edit handler
            onAdd={() => showAddCashFlowModal('outgoing')}
            title="Outgoing Cash Flow"
          />
        </Col>
      </Row>
      <AddCashFlowModal
        visible={isCashFlowModalVisible}
        categories={categories}
        cashFlowType={cashFlowType} // Pass the type of cash flow
        onSubmit={handleAddOrEditCashFlow}
        onCancel={handleCancelCashFlowModal}
        initialData={editingData || undefined} // Set initial data for editing
        cabang={cabang}
        categoryModalOnClick={showAddCategoryModal}
      />
      <AddCategoryModal
        visible={isCategoryModalVisible}
        onSubmit={handleAddCategory}
        onCancel={handleCancelCategoryModal}
      />
      {/* <Button type="primary" onClick={showAddCategoryModal} style={{ marginTop: '20px' }}>
        Add New Category
      </Button> */}
    </div>
  );
};

export default Page;
