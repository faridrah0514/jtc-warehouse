import React, { useState, useMemo } from 'react';
import { Modal, Form, Select, Radio, DatePicker, Button, message } from 'antd';
import { CashFlowCategory } from '../../../types/master';
import { useFetchCabang } from '../../../hooks/useFetchCabang';
import { useFetchCategories } from '../../../hooks/useFetchCategories';

interface ReportFiltersModalProps {
  selectedCabang: number | null;
  setSelectedCabang: (value: number | null) => void;
  cashFlowType: 'incoming' | 'outgoing' | 'both';
  setCashFlowType: (value: 'incoming' | 'outgoing' | 'both') => void;
  selectedCategories: string[];
  setSelectedCategories: (value: string[]) => void;
  periodType: 'monthly' | 'yearly';
  setPeriodType: (value: 'monthly' | 'yearly') => void;
  selectedPeriod: any;
  setSelectedPeriod: (value: any) => void;
  refreshConfigurations: () => void; // New prop to trigger data refresh
}

export const ReportFiltersModal: React.FC<ReportFiltersModalProps> = ({
  selectedCabang,
  setSelectedCabang,
  cashFlowType,
  setCashFlowType,
  selectedCategories,
  setSelectedCategories,
  periodType,
  setPeriodType,
  selectedPeriod,
  setSelectedPeriod,
  refreshConfigurations, // Callback to refresh data
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Fetch real data for cabang and categories
  const { cabang: cabangOptions }: { cabang: { id: number; nama_perusahaan: string }[] } = useFetchCabang();
  const { categories: categoryOptions, loading: categoriesLoading } = useFetchCategories();

  // Handle modal visibility
  const showModal = () => setIsModalVisible(true);
  const hideModal = () => setIsModalVisible(false);

  // Filter categories based on the cashFlowType selection
  const filteredCategories = useMemo(() => {
    if (cashFlowType === 'both') return categoryOptions;
    return categoryOptions?.filter(category => category.type === cashFlowType);
  }, [cashFlowType, categoryOptions]);

  // Function to save the filter configuration to the database
  const saveConfiguration = async (values: any) => {
    try {
      const response = await fetch('/api/report-filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cabang_id: values.cabang,
          cash_flow_type: values.cashFlowType,
          categories: values.categories,
          period_type: values.periodType,
          period_date: values.period.format('YYYY-MM-DD'),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save filter configuration');
      }

      message.success('Filter configuration saved successfully!');
      refreshConfigurations(); // Refresh configurations on successful save
      form.resetFields(); // Reset form fields after saving
    } catch (error: any) {
      message.error(error.message || 'Failed to save filter configuration.');
    }
  };

  // Handle form submission
  const handleFormSubmit = () => {
    form.validateFields().then(values => {
      // Set the selected state values
      setSelectedCabang(values.cabang);
      setCashFlowType(values.cashFlowType);
      setSelectedCategories(values.categories);
      setPeriodType(values.periodType);
      setSelectedPeriod(values.period);

      // Save the filter configuration
      saveConfiguration(values);

      hideModal();
    });
  };

  return (
    <>
      {/* Button to open modal */}
      <Button type="primary" onClick={showModal}>
        Set Filters
      </Button>

      {/* Modal */}
      <Modal
        title="Cash Flow Report Filters"
        visible={isModalVisible}
        onCancel={hideModal}
        onOk={handleFormSubmit}
        okText="Apply"
      >
        <Form form={form} layout="vertical">
          {/* Cabang Selection */}
          <Form.Item name="cabang" label="Select Cabang" initialValue={selectedCabang}>
            <Select placeholder="Select Cabang">
              {cabangOptions.map((cabang) => (
                <Select.Option key={cabang.id} value={cabang.id}>
                  {cabang.nama_perusahaan}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Cash Flow Type Selection */}
          <Form.Item name="cashFlowType" label="Cash Flow Type" initialValue={cashFlowType}>
            <Radio.Group
              options={[
                { label: 'Incoming', value: 'incoming' },
                { label: 'Outgoing', value: 'outgoing' },
                { label: 'Both', value: 'both' },
              ]}
              onChange={e => setCashFlowType(e.target.value)}
              value={cashFlowType}
            />
          </Form.Item>

          {/* Category Selection */}
          <Form.Item name="categories" label="Select Categories" initialValue={selectedCategories}>
            <Select mode="multiple" placeholder="Select Category" loading={categoriesLoading}>
              {filteredCategories.map((category: CashFlowCategory) => (
                <Select.Option key={category.id} value={category.id}>
                  {category.id} - {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Period Type Selection */}
          <Form.Item name="periodType" label="Period Type" initialValue={periodType}>
            <Radio.Group
              options={[
                { label: 'Monthly', value: 'monthly' },
                { label: 'Yearly', value: 'yearly' },
              ]}
              onChange={e => setPeriodType(e.target.value)}
              value={periodType}
            />
          </Form.Item>

          {/* Date Picker */}
          <Form.Item name="period" label="Select Period" initialValue={selectedPeriod}>
            {periodType === 'monthly' ? (
              <DatePicker picker="month" />
            ) : (
              <DatePicker picker="year" />
            )}
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
