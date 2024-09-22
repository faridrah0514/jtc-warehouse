'use client';

import React, { useEffect, useState } from 'react';
import { Layout, Menu, theme, Avatar, Dropdown, Space, Spin } from 'antd';
import { UserOutlined, DownOutlined } from '@ant-design/icons';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { MenuProps } from 'antd';
import * as SidebarMenu from './sidebarMenu'; // Import the whole module

const { Header, Content, Sider } = Layout;

const contentStyle: React.CSSProperties = {
    padding: 50,
    background: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 4,
};

const content = <div style={contentStyle} />;

export default function DefaultLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer },
    } = theme.useToken();
    const { data: session, status } = useSession();
    const router = useRouter();

    const capitalizedUsername = session?.user?.name
        ? session.user.name.charAt(0).toUpperCase() + session.user.name.slice(1)
        : '';

    useEffect(() => {
        if (status === 'unauthenticated') {
            // Redirect to login if user is not logged in
            router.push('/login');
        }
    }, [status, router]);

    if (status === 'loading') {
        return <div className="flex justify-center items-center h-screen">
            <Spin tip="Loading" size="large">
                {content}
            </Spin>
        </div>
    }

    // Get user's role
    const userRole = session?.user?.role;

    // Define menu items for Dropdown
    const dropdownMenuItems: MenuProps['items'] = [
        ...(userRole === 'admin' ? [{
            key: '0',
            label: 'User Management',
            onClick: () => { router.push('/users/list') }
        }] : []),
        {
            key: '1',
            label: 'Change Password',
            onClick: () => { router.push('/profile') }
        },
        {
            type: 'divider',
        },
        {
            key: '2',
            label: 'Log Out',
            onClick: () => { signOut({ callbackUrl: '/login' }) }
        }
    ];

    if (!session) {
        return null; // or a loading spinner, or redirect to login
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <div className="demo-logo-vertical pb-20" />
                <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={SidebarMenu.items} />
            </Sider>

            <Layout>
                <Header style={{
                    padding: 0,
                    display: 'flex',
                    background: colorBgContainer,
                    alignItems: 'center',
                    justifyContent: 'end',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar icon={<UserOutlined />} />
                        <Dropdown className='pl-2 pr-10' menu={{ items: dropdownMenuItems }} trigger={['click']}>
                            <a onClick={(e) => e.preventDefault()}>
                                <Space>
                                    Hi, {capitalizedUsername}
                                    <DownOutlined />
                                </Space>
                            </a>
                        </Dropdown>
                    </div>
                </Header>

                <Content style={{ margin: '0 16px' }}>
                    <div
                        style={{
                            margin: '16px 0',
                            padding: 24,
                            minHeight: 360,
                            background: colorBgContainer,
                        }}
                    >
                        {children}
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};
