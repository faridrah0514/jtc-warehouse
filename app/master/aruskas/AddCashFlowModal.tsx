import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, DatePicker, Select, Button, Divider, Upload, UploadFile, message, Image } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { CashFlowCategory, CashFlow } from '../../types/master';
import { CurrencyInput } from '../../components/currencyInput/currencyInput';
import dayjs from 'dayjs';

interface AddCashFlowModalProps {
  visible: boolean;
  categories: CashFlowCategory[];
  cashFlowType: 'incoming' | 'outgoing';
  onSubmit: (values: Omit<CashFlow, 'id'>, files: UploadFile[]) => void;
  onCancel: () => void;
  initialData?: CashFlow | null;
  cabang: { id: string; nama_perusahaan: string }[];
  categoryModalOnClick: () => void;
}

const AddCashFlowModal: React.FC<AddCashFlowModalProps> = ({
  visible,
  categories,
  cashFlowType,
  onSubmit,
  onCancel,
  initialData,
  cabang,
  categoryModalOnClick
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const handleOk = () => {
    form.submit();
  };

  const handleFormSubmit = (values: any) => {
    const formattedValues = {
      ...values,
      amount: parseFloat(values.amount),
      date: values.date.format('YYYY-MM-DD'),
    };
    onSubmit(formattedValues, fileList);
    form.resetFields();
    setFileList([]); // Reset file list after submission
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as File);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  // Set initial values when editing
  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        ...initialData,
        date: initialData.date ? dayjs(initialData.date) : null,
        amount: parseFloat(initialData.amount),
      });
    } else {
      form.resetFields();
    }
  }, [initialData, form]);

  // Filter categories based on the cashFlowType
  const filteredCategories = categories.filter(category => category.type === cashFlowType);

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
          label="Kategori"
          rules={[{ required: true, message: 'Please select a category' }]}
        >
          <Select
            placeholder="Pilih Kategori"
            dropdownRender={(menu) => (
              <>
                {menu}
                <Divider style={{ margin: '0' }} />
                <Button type="link" onClick={categoryModalOnClick}>
                  + Tambah Kategori
                </Button>
              </>
            )}
          >
            {filteredCategories.map(category => (
              <Select.Option key={category.id} value={category.id}>
                {`${category.id} - ${category.name}`}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="cabang_id"
          label="Nama Cabang"
          rules={[{ required: true, message: 'Please select a company' }]}
        >
          <Select placeholder="Pilih Cabang">
            {cabang?.map((company) => (
              <Select.Option key={company.id} value={company.id}>
                {company.nama_perusahaan}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="description"
          label="Deskripsi"
          rules={[{ required: true, message: 'Please input the description' }]}
        >
          <Input placeholder='Enter a Description' />
        </Form.Item>
        <Form.Item
          name="amount"
          label="Jumlah"
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
          label="Tanggal"
          rules={[{ required: true, message: 'Please select the date' }]}
        >
          <DatePicker format='' style={{ width: '100%' }} />
        </Form.Item>

        {/* Upload Files */}
        <Form.Item name="file" label="Upload Dokumen" rules={[{ required: true, message: 'Please upload a document' }]}>
          <Upload
            multiple
            onPreview={handlePreview}
            listType='picture-card'
            beforeUpload={(file) => {
              setFileList([...fileList, file])
            }}
            onRemove={(file) => {
              setFileList(
                fileList.filter(v => file.uid != v.uid)
              )
            }}
          >
            {fileList.length >= 5 ? null : (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        {/* Image Preview */}
        {previewImage && (
          <Image
            wrapperStyle={{ display: 'none' }}
            preview={{
              visible: previewOpen,
              onVisibleChange: (visible) => setPreviewOpen(visible),
              afterOpenChange: (visible) => !visible && setPreviewImage(''),
            }}
            src={previewImage}
          />
        )}
      </Form>
    </Modal>
  );
};

export default AddCashFlowModal;
