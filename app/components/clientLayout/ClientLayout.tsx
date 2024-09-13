
'use client';

import { usePathname } from 'next/navigation';
import DefaultLayout from '../defaultLayout/DefaultLayout';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Define paths where the DefaultLayout should be skipped
  const isAuthPage = pathname === '/login'; // Add other auth pages if needed

  return isAuthPage ? <>{children}</> : <DefaultLayout>{children}</DefaultLayout>;
}
