'use client';

import './globals.css';
import { Toaster } from 'react-hot-toast';
import { Navbar } from '@/components/Navbar';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <html lang="zh-CN">
      <body>
        <Navbar />
        <main className="min-h-screen pt-16">{children}</main>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
