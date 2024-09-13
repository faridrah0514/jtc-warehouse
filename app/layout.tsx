
import './globals.css';
import { Inter } from 'next/font/google';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import ClientLayout from './components/clientLayout/ClientLayout';
import SessionProviderWrapper from './components/sessionProviderWrapper/SessionProviderWrapper';


export const metadata = {
  title: 'JTC Warehouse',
  description: 'Aplikasi Sewa Gudang JTC Warehouse',
};

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AntdRegistry>
          <SessionProviderWrapper>
            <ClientLayout>{children}</ClientLayout>
          </SessionProviderWrapper>
        </AntdRegistry>
      </body>
    </html>
  );
}
