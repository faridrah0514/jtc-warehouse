import {
    DashboardOutlined,
    BranchesOutlined,
    UsergroupAddOutlined,
    BankOutlined,
    TransactionOutlined,
    ReconciliationOutlined,
    ThunderboltOutlined,
    DollarCircleOutlined,
    FileTextOutlined,
    LineChartOutlined,
    FileDoneOutlined,
    AppstoreOutlined,
    SettingOutlined,
    MoneyCollectOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import Link from 'next/link';
import { useSession } from 'next-auth/react'; // Import useSession to access user role

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

export default function MenuItems({ userRole }: { userRole: string }) {
    const financeItems: MenuItem[] = [
        getItem(<Link href='/finance'>Finance</Link>, 'Finance', <LineChartOutlined />, [
            getItem(<Link href='/finance/aruskas'>Arus Kas</Link>, 'Arus Kas', <LineChartOutlined />,[
                getItem(<Link href='/finance/aruskas/in'>Kas Masuk</Link>, 'Kas Masuk', <DollarCircleOutlined />),
                getItem(<Link href='/finance/aruskas/out'>Kas Keluar</Link>, 'Kas Keluar', <MoneyCollectOutlined />), 
            ]),
            getItem(<Link href='/finance/laporan'>Laporan</Link>, 'Laporan', <FileDoneOutlined />),
            getItem(<Link href='/finance/kategori'>Kategori</Link>, 'Kategori', <AppstoreOutlined />),
        ]),
    ];

    const defaultItems: MenuItem[] = [
        getItem(<Link href='/dashboard'>Dashboard</Link>, 'Dashboard', <DashboardOutlined />),
        getItem(<Link href='/master/cabang'>Cabang</Link>, 'Cabang', <BranchesOutlined />),
        getItem(<Link href='/master/pelanggan'>Pelanggan</Link>, 'Pelanggan', <UsergroupAddOutlined />),
        getItem(<Link href='/master/aset'>Aset</Link>, 'Aset', <BankOutlined />),
        getItem(<Link href='/master/transaksi'>Transaksi</Link>, 'transaksi', <TransactionOutlined />, [
            getItem(<Link href='/master/transaksi/sewa'>Sewa</Link>, 'Sewa', <ReconciliationOutlined />),
            getItem(<Link href='/master/transaksi/listrik'>Listrik</Link>, 'Listrik', <ThunderboltOutlined />),
            getItem(<Link href='/master/transaksi/ipl'>IPL</Link>, 'IPL', <DollarCircleOutlined />),
        ]),
        getItem(<Link href='/master/laporan'>Laporan</Link>, 'Laporan', <FileTextOutlined />, [
            getItem(<Link href='/master/laporan/transaksi'>Transaksi</Link>, 'Laporan Transaksi', <FileTextOutlined />),
        ]),
    ];

    const otherItems: MenuItem[] = [
        getItem(<Link href='/master/other'>Lain-Lain</Link>, 'Tipe Aset & Sertifikat', <SettingOutlined />),
    ];

    // Return the items based on the role
    const itemsToShow = userRole === 'finance' ? financeItems : [...defaultItems, ...financeItems, ...otherItems];
    return itemsToShow;
}
