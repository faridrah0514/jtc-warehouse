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
    <Modal title="Tambah Kategori" visible={visible} onCancel={onCancel} onOk={handleOk} okText="Submit">
      <Form form={form} onFinish={handleFormSubmit} layout="vertical">
        <Form.Item
          name="name"
          label="Nama Kategori"
          rules={[{ required: true, message: 'Please input the category name' }]}
        >
          <Input placeholder="Masukkan kategori" />
        </Form.Item>
        <Form.Item
          name="type"
          label="Type"
          rules={[{ required: true, message: 'Please select the type' }]}
        >
          <Select placeholder="Pilih Kategori">
            <Select.Option value="incoming">Kas Masuk</Select.Option>
            <Select.Option value="outgoing">Kas Keluar</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="description" label="Deskripsi">
          <Input.TextArea placeholder="Masukkan Deskripsi"/>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddCategoryModal;
