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
    getItem(<Link href='/dashboard'>Dashboard</Link>, 'Dashboard', <PieChartOutlined />),
    getItem(<Link href='/master/cabang'>Cabang</Link>, 'Cabang'),
    getItem(<Link href='/master/pelanggan'>Pelanggan</Link>, 'Pelanggan'),
    // getItem(<Link href='/master/utility'>Utility</Link>, 'Utility'),
    getItem(<Link href='/master/aset'>Aset</Link>, 'Aset'),
    getItem(<Link href='/master/transaksi'>Transaksi</Link>, 'transaksi', <></>, [
        getItem(<Link href='/master/transaksi/sewa'>Sewa</Link>, 'Sewa'),
    ]),
];

