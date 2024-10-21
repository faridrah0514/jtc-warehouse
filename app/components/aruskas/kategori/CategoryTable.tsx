'use client'
import React, { useEffect, useState } from 'react';
import { Table, Button, message, Popconfirm, Form } from 'antd';
import { CashFlowCategory } from '@/app/types/master';
import { useFetchCategories } from '../../../hooks/aruskas/other/useFetchCategories';
import AddCategoryModal from './AddCategoryModal';

const CategoryTable: React.FC = () => {
    const [categories, setCategories] = useState<CashFlowCategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const { fetchCategories, addCategory, updateCategory, deleteCategory } = useFetchCategories();
    const [form] = Form.useForm();

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

            // Check for response.ok and handle the response as JSON
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
                // Update existing category
                await updateCategory(values.id, { name: values.name, category_id: values.category_id, type: values.type });
                message.success('Category updated successfully');
            } else {
                // Add new category
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

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <div className="flex justify-between mb-4">
                    <h1 className="text-2xl font-semibold">Kategori Arus Kas</h1>
                    <Button type="primary" onClick={handleAddCategory}>
                        + Tambah Kategori
                    </Button>
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
        </>
    );
};

export default CategoryTable;
