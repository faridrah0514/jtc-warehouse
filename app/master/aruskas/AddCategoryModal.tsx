import React from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { CashFlowCategory } from '../../types/master';

interface AddCategoryModalProps {
  visible: boolean;
  onSubmit: (values: Omit<CashFlowCategory, 'id'>) => void;
  onCancel: () => void;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ visible, onSubmit, onCancel }) => {
  const [form] = Form.useForm();

  const handleOk = () => {
    form.submit();
  };

  const handleFormSubmit = (values: any) => {
    onSubmit(values);
    form.resetFields();
  };

  return (
    <Modal title="Add Cash Flow Category" visible={visible} onCancel={onCancel} onOk={handleOk} okText="Submit">
      <Form form={form} onFinish={handleFormSubmit} layout="vertical">
        <Form.Item
          name="name"
          label="Category Name"
          rules={[{ required: true, message: 'Please input the category name' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="type"
          label="Type"
          rules={[{ required: true, message: 'Please select the type' }]}
        >
          <Select>
            <Select.Option value="incoming">Incoming</Select.Option>
            <Select.Option value="outgoing">Outgoing</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddCategoryModal;
