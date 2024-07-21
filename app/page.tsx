'use client'
import Image from "next/image";
import type { Metadata } from "next";
import { Card, Col, Row } from "antd";

// export const projectRoot = process.cwd()
import { useEffect } from 'react';
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return null;
}
