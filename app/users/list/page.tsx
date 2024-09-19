'use client';

import { useState, useEffect } from 'react';
import { Table, Button, message, Popconfirm } from 'antd';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface User {
  id: number;
  username: string;
  role: string;
  created_at: string;
}

const Page: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession(); // Get current user session
  const router = useRouter();

  const currentUser = session?.user?.username; // Extract current user's username
  const currentUserRole = session?.user?.role; // Extract current user's role
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cred', { method: 'GET', cache: 'no-store' });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.data || []);
    } catch (error: any) {
      message.error(error.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    router.push('/users/new');
  };

  const handleEditUser = (id: number) => {
    // Only allow non-admin users to edit their own account
    if (currentUserRole !== 'admin' && id !== session?.user?.id) {
      message.error('You can only edit your own account');
      return;
    }
    router.push(`/users/edit/${id}`);
  };

  const handleDeleteUser = async (id: number) => {
    setLoading(true);
    try {
      const response = await fetch('/api/cred', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestType: 'delete-user',
          id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      message.success('User deleted successfully');
      fetchUsers(); // Refresh the user list
    } catch (error: any) {
      message.error(error.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: User) => (
        <div className="flex">
          <Button
            type="link"
            onClick={() => handleEditUser(record.id)}
            disabled={currentUserRole !== 'admin' && currentUser !== record.username}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete this user?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Yes"
            cancelText="No"
            disabled={currentUser === record.username || currentUserRole !== 'admin'} // Disable if current user is trying to delete themselves or if user isn't an admin
          >
            <Button type="link" danger disabled={currentUser === record.username || currentUserRole !== 'admin'}>
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100">
      <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between mb-4">
          <h1 className="text-2xl font-semibold">User List</h1>
          <Button type="primary" onClick={handleCreateUser} disabled={currentUserRole !== 'admin'}>
            Create New User
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </div>
    </div>
  );
};

export default Page;
