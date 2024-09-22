'use client';

import React, { useEffect, useState } from 'react';
import { Layout, Menu, theme, Avatar, Dropdown, Space, Spin, Breadcrumb } from 'antd';
import { UserOutlined, DownOutlined } from '@ant-design/icons';
import { signOut, useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation'; // Import usePathname
import Link from 'next/link'; // Use Next.js' built-in Link
import type { MenuProps } from 'antd';
import * as SidebarMenu from './sidebarMenu'; // Import the whole module

const { Header, Content, Sider } = Layout;

const contentStyle: React.CSSProperties = {
    padding: 50,
    background: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 4,
};

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
    const pathname = usePathname(); // Get the current pathname

    const capitalizedUsername = session?.user?.name
        ? session.user.name.charAt(0).toUpperCase() + session.user.name.slice(1)
        : '';

    // Generate breadcrumb items based on the pathname
    const breadcrumbItems = pathname
        ? pathname
            .split('/')
            .filter((path) => path) // Remove empty paths
            .map((path, index, array) => {
                const url = `/${array.slice(0, index + 1).join('/')}`;
                return {
                    title: (
                        <Link href={url}>
                            {path.charAt(0).toUpperCase() + path.slice(1)}
                        </Link>
                    ),
                };
            })
        : [{ title: <Link href="/">Home</Link> }];

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    if (status === 'loading') {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <Spin tip="Loading" size="large">
                    <div style={contentStyle} />
                </Spin>
            </div>
        );
    }

    // Get user's role
    const userRole = session?.user?.role;

    // Define menu items for Dropdown
    const dropdownMenuItems: MenuProps['items'] = [
        ...(userRole === 'admin'
            ? [
                {
                    key: '0',
                    label: 'User Management',
                    onClick: () => {
                        router.push('/users/list');
                    },
                },
            ]
            : []),
        {
            key: '1',
            label: 'Change Password',
            onClick: () => {
                router.push('/profile');
            },
        },
        {
            type: 'divider',
        },
        {
            key: '2',
            label: 'Log Out',
            onClick: () => {
                signOut({ callbackUrl: '/login' });
            },
        },
    ];

    if (!session) {
        return null;
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Sidebar with padding to move it down */}
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <div className="py-6"> {/* Adds padding from the top */}
                    <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={SidebarMenu.items} />
                </div>
            </Sider>

            <Layout>
                {/* Header with logo and user avatar */}
                <Header
                    style={{
                        padding: '0 20px',
                        display: 'flex',
                        alignItems: 'center',
                        background: colorBgContainer,
                        justifyContent: 'space-between', // Adjust to fit both logo and user profile
                    }}
                >
                    {/* Logo on the left */}
                    <div className="flex items-center">
                        <img
                            src="/jtc-logo.png"
                            alt="JTC Warehouse Logo"
                            className="h-10 w-auto" // Adjust size as needed
                        />
                    </div>

                    {/* User profile and dropdown on the right */}
                    <Dropdown menu={{ items: dropdownMenuItems }} trigger={['click']}>
                        <Space>
                            <Avatar icon={<UserOutlined />} />
                            <span className="hidden sm:block">Hi, {capitalizedUsername}</span>
                            <DownOutlined />
                        </Space>
                    </Dropdown>
                </Header>

                {/* Breadcrumb below Header and above Content */}
                <Breadcrumb style={{ margin: '16px 24px' }} items={breadcrumbItems} />

                {/* Content area */}
                <Content style={{ margin: '0 16px', padding: '24px', background: colorBgContainer }}>
                    <div className=" bg-white">{children}</div>
                </Content>
            </Layout>
        </Layout>
    );
}
