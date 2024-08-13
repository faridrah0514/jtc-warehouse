import {
    CreditCardOutlined,
    FolderOpenOutlined,
    HomeOutlined,
    InsertRowLeftOutlined,
    PartitionOutlined,
    PieChartOutlined,
    SolutionOutlined,
    TeamOutlined,
    ThunderboltOutlined,
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
    getItem(<Link href='/master/cabang'>Cabang</Link>, 'Cabang', <PartitionOutlined />),
    getItem(<Link href='/master/pelanggan'>Pelanggan</Link>, 'Pelanggan', <TeamOutlined/>),
    // getItem(<Link href='/master/utility'>Utility</Link>, 'Utility'),
    getItem(<Link href='/master/aset'>Aset</Link>, 'Aset', <FolderOpenOutlined />),
    getItem(<Link href='/master/transaksi'>Transaksi</Link>, 'transaksi', <CreditCardOutlined />, [
        getItem(<Link href='/master/transaksi/sewa'>Sewa</Link>, 'Sewa', <SolutionOutlined />),
        getItem(<Link href='/master/transaksi/listrik'>Listrik</Link>, 'Listrik', <ThunderboltOutlined/>),
        getItem(<Link href='/master/transaksi/ipl'>IPL</Link>, 'IPL', <HomeOutlined/>),
    ]),
    getItem(<Link href='/master/laporan'>Laporan</Link>, 'Laporan', <InsertRowLeftOutlined/>),
];

