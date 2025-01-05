'use client';

import { useState } from 'react';
import { Form, Input, Button, Select, message, InputNumber } from 'antd';
import { useRouter } from 'next/navigation';

const { Option } = Select;

const Page: React.FC = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<string>('');

  const handleCreateUser = async (values: { username: string; password: string; verifiedPassword: string; role: string; editable_until?: number }) => {
    setLoading(true);
    try {
      const response = await fetch('/api/cred', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestType: 'add-user',
          data: {
            username: values.username,
            password: values.password,
            role: values.role,
            editable_until: values.editable_until,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      message.success('User created successfully');
      router.push('/users/list');
    } catch (error: any) {
      message.error(error.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center p-4 bg-gray-100">
      <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold mb-4">Create New User</h1>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateUser}
          initialValues={{ username: '', password: '', verifiedPassword: '', role: '' }}
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please enter a username' }]}
          >
            <Input className="w-full" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter a password' }]}
            hasFeedback
          >
            <Input.Password className="w-full" />
          </Form.Item>

          <Form.Item
            name="verifiedPassword"
            label="Confirm Password"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password className="w-full" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select placeholder="Select a role" className="w-full" onChange={(value) => setRole(value)}>
              <Option value="admin">Admin</Option>
              <Option value="supervisor">Supervisor</Option>
              <Option value="reporter">Reporter</Option>
              <Option value="finance">Finance</Option>
              <Option value="finance-reporter">Finance Reporter</Option>
            </Select>
          </Form.Item>

          {role === 'supervisor' || role === 'finance' && (
            <Form.Item
              name="editable_until"
              label="Days Editable"
              rules={[{ required: true, message: 'Please enter the number of days the entry is editable' }]}
            >
              <InputNumber min={1} className="w-full" />
            </Form.Item>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} className="w-full">
              Create User
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Page;
