'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Typography, Alert } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function Page() {
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (values: { username: string; password: string }) => {
    const result = await signIn('credentials', {
      username: values.username,
      password: values.password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid credentials');
    } else {
      router.push('/');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-xl p-6 bg-white shadow-lg rounded-lg">
        {/* Logo added here */}
        <div className="flex justify-center mb-4">
          <img src="/jtc-logo.png" alt="JTC Warehouse Logo" className="h-20 w-20" />
        </div>
        
        <Title level={2} className="text-center">Welcome To JTC Warehouse App</Title>
        <Text type="secondary" className="block text-center mb-4">
          Please login to your account
        </Text>
        {error && <Alert message={error} type="error" showIcon className="mb-4" />}
        
        <Form onFinish={handleLogin} className="space-y-4">
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Username"
              size="large"
              className="rounded-lg"
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" className="rounded-lg">
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
