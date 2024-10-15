'use client';

import { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import { useRouter, useParams } from 'next/navigation';

const { Option } = Select;

const EditUserPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();
  const { id } = useParams();

  const [initialValues, setInitialValues] = useState({
    username: '',
    role: '',
  });

  useEffect(() => {
    if (typeof id === 'string') {
      fetchUserDetails(id);
    }
  }, [id]);

  const fetchUserDetails = async (userId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/cred/${userId}`, { method: 'GET' });
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }
  
      const data = await response.json();
      setInitialValues({
        username: data.username,
        role: data.role,
      });
      form.setFieldsValue({
        username: data.username,
        role: data.role,
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: { username: string; password: string; verifyPassword: string; role: string }) => {
    if (values.password !== values.verifyPassword) {
      message.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/cred/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestType: 'edit-user',
          data: {
            username: values.username,
            password: values.password,
            role: values.role,
          },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        message.success('User updated successfully');
        router.push('/users/list'); // Redirect to users list page
      } else {
        message.error(data.error || 'Something went wrong');
      }
    } catch (error) {
      message.error('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center p-6 bg-gray-100">
      <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold mb-4">Edit User</h1>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={initialValues}
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Please input the username!' }]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: false, message: 'Please input the password if you want to change it!' }]}
          >
            <Input.Password placeholder="Leave blank to keep unchanged" />
          </Form.Item>

          <Form.Item
            label="Verified Password"
            name="verifyPassword"
            rules={[
              { required: false, message: 'Please verify the password if you are changing it!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Verify new password" />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: 'Please select a role!' }]}
          >
            <Select placeholder="Select a role">
              <Option value="admin">Admin</Option>
              <Option value="supervisor">Supervisor</Option>
              <Option value="reporter">Reporter</Option>
              <Option value="finance">Finance</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} className="w-full">
              Update User
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default EditUserPage;
