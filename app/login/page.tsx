'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Typography, Alert } from 'antd';

const { Title } = Typography;

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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ width: '300px' }}>
        <Title level={2}>Sign In</Title>
        {error &&  <div className='pb-2'><Alert  message={error} type="error" showIcon /></div>}
        <Form onFinish={handleLogin}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input placeholder="Username" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
