import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, DatePicker, Select, Button, Divider, Upload, UploadFile, message, Image, Table, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { CashFlowCategory, CashFlow } from '@/app/types/master';
import { CurrencyInput } from '@/app/components/currencyInput/currencyInput';
import dayjs from 'dayjs';

interface AddCashFlowModalProps {
  visible: boolean;
  categories: CashFlowCategory[];
  cashFlowType: 'incoming' | 'outgoing';
  onSubmit: (values: Omit<CashFlow, 'id'>, files: UploadFile[]) => void;
  onCancel: () => void;
  initialData?: CashFlow | null;  // Indicates if we're in edit mode
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
  const [editFileList, setEditFileList] = useState<UploadFile[]>([])



  const handleOk = () => {
    form.submit();
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  }

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


  // Populate fileList when in edit mode (initialData)
  useEffect(() => {
    if (initialData && initialData.files) {
      form.setFieldsValue({
        ...initialData,
        date: initialData.date ? dayjs(initialData.date) : null,
        amount: parseFloat(initialData.amount),
      })
      const filesFromData = initialData.files.map((fileName, index) => ({
        uid: `${index}`,
        name: fileName,
        status: 'done' as 'done',
        url: `${initialData.folder_path}/${fileName}`,
      }));
      setEditFileList(filesFromData);
    } else {
      setEditFileList([]);
    }
  }, [initialData]);

  const handleDelete = (file: UploadFile) => {
    const fileUrl = file.url as string;
    fetch(`/api/finance/cashflow/files`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileUrl }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        message.success('File deleted successfully');
        setEditFileList(editFileList.filter(f => f.uid !== file.uid));
      })
      .catch((error) => {
        console.error('Error deleting file:', error);
        message.error('Failed to delete file');
      });
  };

  // Table columns for the file list
  const columns = [
    {
      title: 'Dokumen',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, file: UploadFile) => (
        <a href={file.url || '#'} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, file: UploadFile) => (
        <Popconfirm
          title="Are you sure to delete this file?"
          onConfirm={() => handleDelete(file)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="link" danger>
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  // Filter categories based on the cashFlowType
  const filteredCategories = categories.filter(category => category.type === cashFlowType);

  return (
    <Modal
      title={initialData ? 'Edit Arus Kas' : 'Tambah Arus Kas'}
      open={visible}
      onCancel={handleCancel}
      onOk={handleOk}
      okText="Submit"
    >
      <Form form={form} onFinish={handleFormSubmit} layout="vertical">
        <Form.Item
          name="date"
          label="Tanggal"
          rules={[{ required: true, message: 'Please select the date' }]}
        >
          <DatePicker format='DD-MM-YYYY' style={{ width: '100%' }} />
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
          name="description"
          label="Keterangan"
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

        {/* Upload Files */}
        <Form.Item name="file" label="Upload Dokumen">
          <Upload
            multiple
            onPreview={handlePreview}
            listType='picture-card'
            beforeUpload={(file) => {
              setFileList([...fileList, file]);
              return false; // Prevent the file from uploading automatically
            }}
            onRemove={(file) => {
              setFileList(fileList.filter(v => file.uid !== v.uid));
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

        {/* Display Uploaded Files in Table when in edit mode */}
        {initialData && (
          <Table
            columns={columns}
            dataSource={editFileList}
            pagination={false}
            rowKey="uid"
            size='small'
          />
        )}

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
