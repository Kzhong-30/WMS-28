'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { FiFileText, FiUsers, FiTag, FiFolder, FiBarChart2 } from 'react-icons/fi';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [user, isLoading, router, mounted]);

  if (!mounted || isLoading || !user || user.role !== 'ADMIN') return null;

  const navItems = [
    { href: '/admin', icon: FiBarChart2, label: '仪表盘', exact: true },
    { href: '/admin/articles', icon: FiFileText, label: '文章审核' },
    { href: '/admin/users', icon: FiUsers, label: '用户管理' },
    { href: '/admin/categories', icon: FiFolder, label: '分类管理' },
    { href: '/admin/tags', icon: FiTag, label: '标签管理' },
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full">
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900">管理后台</h2>
        </div>
        <nav className="px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}
