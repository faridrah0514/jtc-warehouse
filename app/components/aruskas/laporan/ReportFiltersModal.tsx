import React, { useState, useMemo } from 'react';
import { Modal, Form, Select, Radio, DatePicker, Button, message } from 'antd';
import { CashFlowCategory } from '../../../types/master';
import { useFetchCabang } from '../../../hooks/useFetchCabang';
import { useFetchCategories } from '../../../hooks/useFetchCategories';
import { Session } from 'next-auth';

interface ReportFiltersModalProps {
  selectedCabang: number | null;
  setSelectedCabang: (value: number | null) => void;
  cashFlowType: 'incoming' | 'outgoing' | 'both';
  setCashFlowType: (value: 'incoming' | 'outgoing' | 'both') => void;
  selectedCategories: string[];
  setSelectedCategories: (value: string[]) => void;
  periodType: 'monthly' | 'yearly' | 'daily';
  setPeriodType: (value: 'monthly' | 'yearly' | 'daily') => void;
  selectedPeriod: any;
  setSelectedPeriod: (value: any) => void;
  refreshConfigurations: () => void; // New prop to trigger data refresh
  sessionData: Session | null
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
  sessionData
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [reportType, setReportType] = useState<any>('period'); // Default to 'period' (Arus Kas)
  const [form] = Form.useForm();

  // Fetch real data for cabang and categories
  const { cabang: cabangOptions }: { cabang: { id: number; nama_perusahaan: string }[] } = useFetchCabang();
  const { categories: categoryOptions, loading: categoriesLoading } = useFetchCategories();

  // Handle modal visibility
  const showModal = () => setIsModalVisible(true);
  const hideModal = () => {
    setIsModalVisible(false);
    form.resetFields(); // Reset form fields when the modal is hidden

    // Reset state values to their initial state on modal close
    setSelectedCabang(null);
    setCashFlowType('both');
    setSelectedCategories([]);
    setPeriodType('monthly');
    setSelectedPeriod(null);
  };

  // Filter categories based on the cashFlowType selection
  const filteredCategories = useMemo(() => {
    if (cashFlowType === 'both') return categoryOptions;
    return categoryOptions?.filter(category => category.type === cashFlowType);
  }, [cashFlowType, categoryOptions]);

  // Function to save the filter configuration to the database
  const saveConfiguration = async (values: any) => {
    try {
      const cabangIds = values.cabang.map((nama_perusahaan: string) => {
        const cabang = cabangOptions.find(c => c.nama_perusahaan === nama_perusahaan);
        return cabang ? cabang.id : null;
      }).filter((id: number) => id !== null);

      if (sessionData?.user?.role === 'finance-reporter') {
        const username = sessionData.user.name;
        if (!username) {
          throw new Error('Username is required');
        }
        const response = await fetch(`/api/report-filters/finance-reporter-check/laporan?username=${encodeURIComponent(username)}&jenis_laporan=${values.reportType}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'You are not authorized to save filter configuration');
        } else {
          const response = await fetch('/api/report-filters/finance-reporter-check/laporan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: sessionData?.user.name,
              reportType: values.reportType,
            }),
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save filter configuration');
          }
        }
      }

      const response = await fetch('/api/report-filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // cabang_id: cabangIds,
          report_type: values.reportType,
          cabang_id: cabangIds.join(', '),
          nama_cabang: values.cabang.join(', '),
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
    form.resetFields();
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
    // form.resetFields();
  };

  return (
    <>
      {/* Button to open modal */}
      <Button type="primary" onClick={showModal} className='mb-3'>
        + Buat Laporan
      </Button>

      {/* Modal */}
      <Modal
        title="Form Laporan Kas"
        open={isModalVisible}
        onCancel={hideModal}
        onOk={handleFormSubmit}
        okText="Apply"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Tipe Laporan" name="reportType">
            <Radio.Group
              value={reportType}
              onChange={(e: any) => setReportType(e.target.value)}
            >
              <Radio value="period">Arus Kas (By Period)</Radio>
              <Radio value="category">Berdasarkan Kategori (By Category)</Radio>
            </Radio.Group>
          </Form.Item>
          {/* Cabang Selection */}
          <Form.Item name="cabang" label="Pilih Cabang" initialValue={selectedCabang}>
            <Select mode="multiple" placeholder="Pilih Nama Cabang">
              {cabangOptions.map((cabang) => (
                <Select.Option key={cabang.id} value={cabang.nama_perusahaan}>
                  {cabang.nama_perusahaan}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Cash Flow Type Selection */}
          <Form.Item name="cashFlowType" label="Tipe Kas" initialValue={cashFlowType}>
            <Radio.Group
              options={[
                { label: 'Kas Masuk', value: 'incoming' },
                { label: 'Kas Keluar', value: 'outgoing' },
                { label: 'Kas Masuk & Keluar', value: 'both' },
              ]}
              onChange={e => setCashFlowType(e.target.value)}
              value={cashFlowType}
            />
          </Form.Item>

          {/* Category Selection */}
          <Form.Item name="categories" label="Pilih Kategori" initialValue={selectedCategories}>
            <Select mode="multiple" placeholder="Pilih Kategori" loading={categoriesLoading}>
              {filteredCategories.map((category: CashFlowCategory) => (
                <Select.Option key={category.id} value={category.id}>
                  {category.id} - {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Period Type Selection */}
          <Form.Item name="periodType" label="Tipe Period" initialValue={periodType}>
            <Radio.Group
              options={[
                { label: 'Harian', value: 'daily' },
                { label: 'Bulanan', value: 'monthly' },
                { label: 'Tahunan', value: 'yearly' },
              ]}
              onChange={e => setPeriodType(e.target.value)}
              value={periodType}
            />
          </Form.Item>

          {/* Date Picker */}
          <Form.Item name="period" label="Pilih Period" initialValue={selectedPeriod}>
            {periodType === 'monthly' ? (
              <DatePicker picker="month" />
            ) : periodType === 'yearly' ? (
              <DatePicker picker="year" />
            ) : (
              <DatePicker picker="date" />
            )}
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
