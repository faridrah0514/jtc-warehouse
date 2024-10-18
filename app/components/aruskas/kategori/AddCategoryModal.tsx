import React from 'react';
import { Modal, Form, Input, Select, FormInstance } from 'antd';
import { CashFlowCategory } from '@/app/types/master';

interface AddCategoryModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: Omit<CashFlowCategory, 'id'> & { id?: string | null }) => void;
  form: FormInstance | undefined; // Form instance passed from parent
  loading?: boolean;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ visible, onSubmit, onCancel, form }) => {
  // const [form] = Form.useForm();

  const handleOk = () => {
    form?.submit();
  };

  const handleFormSubmit = (values: any) => {
    onSubmit(values);
  };

  return (
    <Modal title="Tambah Kategori" open={visible} onCancel={onCancel} onOk={handleOk} okText="Submit">
      <Form form={form} onFinish={handleFormSubmit} layout="vertical">
        <Form.Item name="id" hidden>
          <Input type="hidden" />
        </Form.Item>
        <Form.Item
          name="category_id"
          label="Nomor Kategori"
          rules={[{ required: true, message: 'Please input the category name' }]}
        >
          <Input placeholder="Masukkan nomor kategori" disabled={form && form?.getFieldValue('category_id') !== null} />
          {/* > */}
          {/* <Input placeholder="Masukkan nomor kategori" /> */}
        </Form.Item>
        <Form.Item
          name="name"
          label="Nama Kategori"
          rules={[{ required: true, message: 'Please input the category name' }]}
        >
          <Input placeholder="Masukkan nama kategori" />
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
        {/* <Form.Item name="description" label="Deskripsi">
          <Input.TextArea placeholder="Masukkan Deskripsi"/>
        </Form.Item> */}
      </Form>
    </Modal>
  );
};

export default AddCategoryModal;
