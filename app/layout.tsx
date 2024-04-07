import "./globals.css";
import DefaultLayout from "./components/defaultLayout/DefaultLayout";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "JTC Warehouse",
  description: "Aplikasi Sewa Gudang JTC Warehouse",
};
import { Inter } from 'next/font/google';
import { AntdRegistry } from "@ant-design/nextjs-registry";
const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <AntdRegistry>
          <DefaultLayout>
            {children}
          </DefaultLayout>
        </AntdRegistry>
      </body>
    </html>
  );
}
