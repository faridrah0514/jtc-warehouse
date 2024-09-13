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

  console.log("session ---> ", session)
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
              Change Password
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Page;


// import { useState } from 'react';
// import { signIn } from 'next-auth/react';
// import { useRouter } from 'next/navigation';
// import { Form, Input, Button, Typography, Alert } from 'antd';

// const { Title } = Typography;

// export default function Page() {
//   const [error, setError] = useState('');
//   const router = useRouter();

//   const handleLogin = async (values: { username: string; password: string }) => {
//     const result = await signIn('credentials', {
//       username: values.username,
//       password: values.password,
//       redirect: false,
//     });

//     if (result?.error) {
//       setError('Invalid credentials');
//     } else {
//       router.push('/');
//     }
//   };

//   return (
//     <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//       <div style={{ width: '300px' }}>
//         <Title level={2}>Sign In</Title>
//         {error &&  <div className='pb-2'><Alert  message={error} type="error" showIcon /></div>}
//         <Form onFinish={handleLogin}>
//           <Form.Item
//             name="username"
//             rules={[{ required: true, message: 'Please input your username!' }]}
//           >
//             <Input placeholder="Username" />
//           </Form.Item>
//           <Form.Item
//             name="password"
//             rules={[{ required: true, message: 'Please input your password!' }]}
//           >
//             <Input.Password placeholder="Password" />
//           </Form.Item>
//           <Form.Item>
//             <Button type="primary" htmlType="submit" block>
//               Sign In
//             </Button>
//           </Form.Item>
//         </Form>
//       </div>
//     </div>
//   );
// }
