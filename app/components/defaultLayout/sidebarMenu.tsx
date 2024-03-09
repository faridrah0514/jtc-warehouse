import {
    DesktopOutlined,
    FileOutlined,
    PieChartOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import Link from 'next/link';
// Link
type MenuItem = Required<MenuProps>['items'][number];

function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
): MenuItem {
    return {
        key,
        icon,
        children,
        label,
    } as MenuItem;
}

export const items: MenuItem[] = [
    // getItem('Cabang', 'Cabang', <PieChartOutlined />),
    // getItem('Pelanggan', '2', <DesktopOutlined />),
    getItem('Master', 'Master', <DesktopOutlined />, [
        getItem(<Link href='/master/cabang'>Cabang</Link>, 'Cabang'),
        getItem(<Link href='/master/pelanggan'>Pelanggan</Link>, 'Pelanggan'),
        getItem(<Link href='/master/utility'>Utility</Link>, 'Utility'),
        getItem('Kelompok', 'Kelompok'),
        getItem('Asset', 'Asset'),
    ]),
    // getItem('Team', 'sub2', <TeamOutlined />, [getItem('Team 1', '6'), getItem('Team 2', '8')]),
    // getItem('Files', '9', <FileOutlined />),
    // getItem('Files1', '91', <FileOutlined />),
    // getItem('Files2', '92', <FileOutlined />),
    // getItem('Files3', '93', <FileOutlined />),

];

