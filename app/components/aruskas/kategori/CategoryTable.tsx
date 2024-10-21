'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Table, Button, message, Popconfirm, Form } from 'antd';
import { CashFlowCategory } from '@/app/types/master';
import { useFetchCategories } from '../../../hooks/aruskas/other/useFetchCategories';
import AddCategoryModal from './AddCategoryModal';
import { useReactToPrint } from 'react-to-print';
import dayjs from 'dayjs';
import { useSession } from 'next-auth/react';

const CategoryTable: React.FC = () => {
    const [categories, setCategories] = useState<CashFlowCategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const { fetchCategories, addCategory, updateCategory, deleteCategory } = useFetchCategories();
    const [form] = Form.useForm();
    const { data: session } = useSession();
    const printTableRef = useRef(null); // Ref for print table

    useEffect(() => {
        fetchCategoriesData();
    }, []);

    // Fetch all categories
    const fetchCategoriesData = async () => {
        setLoading(true);
        try {
            const data = await fetchCategories(); // Your fetching function
            setCategories(data); // Update the state with the new data
        } catch (error) {
            message.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    // Open modal for adding a new category
    const handleAddCategory = () => {
        form.resetFields(); // Reset form fields for adding
        form.setFieldsValue({ id: null, category_id: null }); // Ensure id is set to null for adding
        setCategoryModalVisible(true);
    };

    // Open modal for editing an existing category
    const handleEditCategory = (category: CashFlowCategory) => {
        form.setFieldsValue({
            id: category.id, // Pass the id to differentiate between add and update
            name: category.name,
            category_id: category.id,
            type: category.type,
        });
        setCategoryModalVisible(true);
    };

    // Delete a category
    const handleDeleteCategory = async (categoryId: string) => {
        setLoading(true);
        try {
            const response = await deleteCategory(categoryId);

            if (!response.ok) {
                const errorData = await response.json(); // Parse response data only if not OK
                throw new Error(errorData.error || 'Failed to delete category');
            }

            message.success('Category deleted successfully');
            await fetchCategoriesData(); // Refresh categories list
        } catch (error: any) {
            message.error(error.message || 'Failed to delete category');
        } finally {
            setLoading(false);
        }
    };

    // Close modal
    const handleCancel = () => {
        setCategoryModalVisible(false);
    };

    // Handle form submission for adding or editing a category
    const handleFormSubmit = async (values: Omit<CashFlowCategory, 'id'> & { id?: string | null }) => {
        setLoading(true);
        try {
            if (values.id) {
                await updateCategory(values.id, { name: values.name, category_id: values.category_id, type: values.type });
                message.success('Category updated successfully');
            } else {
                await addCategory({ name: values.name, category_id: values.category_id, type: values.type });
                message.success('Category added successfully');
            }
            fetchCategoriesData();
            setCategoryModalVisible(false);
        } catch (error) {
            message.error('Failed to save category');
        } finally {
            setLoading(false);
            form.resetFields();
        }
    };

    // Define the columns for the main table
    const categoryColumns = [
        {
            title: 'No',
            key: 'no',
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: 'Nama',
            dataIndex: 'name',
            key: 'name',
            render: (text: any, record: CashFlowCategory) => `${record.id} - ${record.name}`
        },
        {
            title: 'Kategori',
            dataIndex: 'type',
            key: 'type',
            render: (text: any) => {
                if (text === 'incoming') {
                    return 'Kas Masuk';
                } else if (text === 'outgoing') {
                    return 'Kas Keluar';
                } else {
                    return 'Other';
                }
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: CashFlowCategory) => (
                <div>
                    <Button type="link" onClick={() => handleEditCategory(record)}>
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure to delete this category?"
                        onConfirm={() => handleDeleteCategory(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="link" danger>
                            Delete
                        </Button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    // Columns for the print table (excluding actions column)
    const printCategoryColumns = categoryColumns.filter(column => column.key !== 'actions' && column.key !== 'no').map(column => {
        if (column.key === 'name') {
            return [
                {
                    title: 'Nomor Kategori',
                    dataIndex: 'id',
                    key: 'id',
                },
                {
                    title: 'Nama Kategori',
                    dataIndex: 'name',
                    key: 'name',
                }
            ];
        }
        return column;
    }).flat();

    // Print handler using react-to-print
    const handlePrint = useReactToPrint({
        content: () => printTableRef.current,
        documentTitle: 'Category Table', // You can customize the print title
    });

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <div className="flex justify-between mb-4">
                    <h1 className="text-2xl font-semibold">Kategori Arus Kas</h1>
                    <div>
                        <Button type="default" onClick={handlePrint} style={{ marginRight: 8 }}>
                            Print
                        </Button>
                        <Button type="primary" onClick={handleAddCategory} style={{ marginRight: 8 }}>
                            + Tambah Kategori
                        </Button>
                    </div>
                </div>
                <Table
                    columns={categoryColumns}
                    dataSource={categories}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 'max-content' }}
                    size='small'
                />
            </div>

            {/* Add or Edit Modal */}
            <AddCategoryModal
                visible={categoryModalVisible}
                onCancel={handleCancel}
                onSubmit={handleFormSubmit}
                form={form} // Pass the form instance
                loading={loading}
            />

            {/* Hidden Table for printing */}
            <div style={{ display: 'none' }}>
                <div ref={printTableRef} style={{ paddingRight: '10px', paddingLeft: '10px', paddingBottom: '20px', fontFamily: 'Arial, sans-serif' }}>
                    <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px', textAlign: 'center' }}>
                        <h1 className="text-2xl font-semibold">Kategori Arus Kas</h1>
                    </div>
                    <Table
                        columns={printCategoryColumns} // Exclude actions column in print table
                        dataSource={categories}
                        rowKey="id"
                        pagination={false}
                        size="small"
                        bordered
                        style={{ marginTop: '10px' }}
                    />
                    <div className="print-footer">
                        <p style={{ fontSize: '10px', color: 'grey', textAlign: 'right' }}>
                            {session?.user?.name} - {dayjs().format('DD MMMM YYYY, HH:mm')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Print-specific styles */}
            <style jsx>{`
            @media print {
                body {
                    margin: 0;
                    padding: 0;
                }
                .print-footer {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 1px 1px;
                    text-align: right;
                    font-size: 5px;
                }
                @page {
                    size: A4;
                    margin: 5mm;
                }
            }
            `}</style>
        </>
    );
};

export default CategoryTable;
