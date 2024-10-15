'use client';

import { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { useSession } from 'next-auth/react';

const Page: React.FC = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();

  const handleChangePassword = async (values: { oldPassword: string; newPassword: string; confirmPassword: string }) => {
    setLoading(true);
    try {
      const response = await fetch('/api/cred', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: session?.user?.name,
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to change password');
      }

      message.success('Password changed successfully');
      // Optionally, sign out after password change
      // await signOut({ callbackUrl: '/login' });
      router.push('/dashboard');
    } catch (error: any) {
      message.error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center p-4 bg-gray-100">
      <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold mb-4">Change Password</h1>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleChangePassword}
          initialValues={{ oldPassword: '', newPassword: '', confirmPassword: '' }}
        >
          <Form.Item
            name="oldPassword"
            label="Old Password"
            rules={[{ required: true, message: 'Please enter your old password' }]}
          >
            <Input.Password className="w-full" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[{ required: true, message: 'Please enter your new password' }]}
          >
            <Input.Password className="w-full" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            rules={[
              { required: true, message: 'Please confirm your new password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords that you entered do not match!'));
                },
              }),
            ]}
          >
            <Input.Password className="w-full" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} className="w-full">
              Ubah Password
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Page;