'use client'

import React, { useEffect, useState } from 'react';
import { Layout, Menu, theme, Avatar } from 'antd';

import { items } from "./sidebarMenu"

import { UserOutlined, DownOutlined } from '@ant-design/icons';
import { Dropdown, Space } from 'antd';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Spin } from 'antd';

const { Header, Content, Footer, Sider } = Layout;

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
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const { data: session, status } = useSession();
    const router = useRouter();

    const capitalizedUsername = session?.user?.name
    ? session.user.name.charAt(0).toUpperCase() + session.user.name.slice(1)
    : '';
    console.log("capitalizedUsername:", capitalizedUsername)
    useEffect(() => {
        if (status === 'unauthenticated') {
            // Redirect to login if user is not logged in
            router.push('/login');
        }
    }, [status, router]);

    if (!session) {
        return <div className="flex justify-center items-center h-screen">
            <Spin tip="Loading" size="large">
                {content}
            </Spin>
        </div>
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <div className="demo-logo-vertical pb-20" />
                <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} />
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
                        <Dropdown className='pl-2 pr-10' menu={{
                            items: [
                                {
                                    key: 0,
                                    label: 'Change Password',
                                    onClick: () => { router.push('/profile') }
                                },
                                {
                                    type: 'divider',
                                },
                                {
                                    key: 1,
                                    label: 'Log Out',
                                    onClick: () => { signOut({ callbackUrl: '/login' }) }
                                }]
                        }} trigger={['click']}>
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
