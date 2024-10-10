import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select, Button, Divider } from 'antd';
import { CashFlowCategory, CashFlow } from '../../types/master';
import { CurrencyInput } from '../../components/currencyInput/currencyInput'; // Adjust the path to where CurrencyInput is located
import dayjs from 'dayjs'; // Import Day.js for date handling

interface AddCashFlowModalProps {
  visible: boolean;
  categories: CashFlowCategory[];
  cashFlowType: 'incoming' | 'outgoing'; // New prop for filtering categories
  onSubmit: (values: Omit<CashFlow, 'id'>) => void;
  onCancel: () => void;
  initialData?: CashFlow | null; // Allow `null` to be passed
  cabang: { id: string; nama_perusahaan: string }[]; // Add this line to define the cabang property
  // categoryModalVisible: boolean;
  // categoryModalOnSubmit: (values: Omit<CashFlowCategory, 'id'>) => void;
  // categoryModalOnCancel: () => void;
  categoryModalOnClick: () => void;
}

const AddCashFlowModal: React.FC<AddCashFlowModalProps> = ({ visible, categories, cashFlowType, onSubmit, onCancel, initialData, cabang, categoryModalOnClick }) => {
  const [form] = Form.useForm();

  const handleOk = () => {
    form.submit();
  };

  const handleFormSubmit = (values: any) => {
    const formattedValues = {
      ...values,
      amount: parseFloat(values.amount), // Ensure amount is stored as a number
      date: values.date.format('YYYY-MM-DD'), // Format the date to match your DB format
    };
    onSubmit(formattedValues);
    form.resetFields();
  };

  // Filter categories based on the cashFlowType
  const filteredCategories = categories.filter(category => {
    // Assuming `category.type` field contains 'incoming' or 'outgoing'
    return category.type === cashFlowType;
  });

  // Set initial values when editing
  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        ...initialData,
        date: initialData.date ? dayjs(initialData.date) : null, // Use Day.js to handle the date
        amount: parseFloat(initialData.amount), // Ensure amount is a number
      });
    } else {
      form.resetFields(); // Reset fields when there's no initial data
    }
  }, [initialData, form]);

  return (
    <Modal
      title={initialData ? 'Edit Cash Flow' : 'Add Cash Flow'}
      visible={visible}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Submit"
    >
      <Form form={form} onFinish={handleFormSubmit} layout="vertical">
        <Form.Item
          name="category_id"
          label="Category"
          rules={[{ required: true, message: 'Please select a category' }]}
        >
          <Select
            placeholder="Select Category"
            dropdownRender={(menu) => (
              <>
                {menu}
                <Divider style={{ margin: '0' }} />
                {/* <Select.Option key="add_new" value="add_new"> */}
                <Button type="link" onClick={categoryModalOnClick}>
                  Add New Category
                </Button>
                {/* </Select.Option> */}
              </>
            )}
          >
            {filteredCategories.map(category => (
              <Select.Option key={category.id} value={category.id}>
                {`${category.id} - ${category.name}`} {/* Show both ID and name */}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="cabang_id"
          label="Nama Cabang"
          rules={[{ required: true, message: 'Please select a company' }]}
        >
          <Select placeholder="Select Cabang">
            {cabang?.map((company) => (
              <Select.Option key={company.id} value={company.id}>
                {company.nama_perusahaan}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please input the description' }]}
        >
          <Input placeholder='Enter a Description' />
        </Form.Item>
        <Form.Item
          name="amount"
          label="Amount"
          rules={[{ required: true, message: 'Please input the amount' }]}
        >
          <CurrencyInput
            value={form.getFieldValue('amount')}
            onChange={(value: number) => form.setFieldsValue({ amount: value })}
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item
          name="date"
          label="Date"
          rules={[{ required: true, message: 'Please select the date' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddCashFlowModal;
