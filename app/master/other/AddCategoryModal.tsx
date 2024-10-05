'use client'
import React from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';
import { CashFlowCategory } from './types';

interface AddCategoryModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: Omit<CashFlowCategory, 'id'> & { id?: string }) => void;
  form: any; // Form instance passed from parent
  loading?: boolean;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  form,
  loading = false,
}) => {
  const handleFinish = (values: Omit<CashFlowCategory, 'id'> & { id?: string }) => {
    onSubmit(values);
  };

  return (
    <Modal
      visible={visible}
      title="Add or Edit Cash Flow Category"
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
        >
          Submit
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
      >
        {/* Hidden ID Field */}
        <Form.Item name="id" hidden>
          <Input type="hidden" />
        </Form.Item>

        <Form.Item
          label="Category Name"
          name="name"
          rules={[{ required: true, message: 'Please input the category name!' }]}
        >
          <Input placeholder="Enter category name" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Please input the description!' }]}
        >
          <Input placeholder="Enter description" />
        </Form.Item>

        <Form.Item
          label="Type"
          name="type"
          rules={[{ required: true, message: 'Please select the type!' }]}
        >
          <Select placeholder="Select type">
            <Select.Option value="incoming">Incoming</Select.Option>
            <Select.Option value="outgoing">Outgoing</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddCategoryModal;
