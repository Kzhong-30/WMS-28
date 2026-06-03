'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { FiEdit, FiHome, FiLogOut, FiSettings, FiUser } from 'react-icons/fi';

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuthStore();

  const isActive = (path: string) => pathname === path;

  if (isLoading) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-primary-600">
              TechCommunity
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive('/') ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FiHome className="w-4 h-4" />
                <span>首页</span>
              </Link>
              {user && (
                <Link
                  href="/editor"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive('/editor') ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FiEdit className="w-4 h-4" />
                  <span>写文章</span>
                </Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition ${
                    pathname.startsWith('/admin')
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FiSettings className="w-4 h-4" />
                  <span>管理后台</span>
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-8 h-8 rounded-full border-2 border-gray-200"
                  />
                  <span className="hidden sm:block text-sm font-medium text-gray-700">{user.username}</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    router.push('/');
                  }}
                  className="p-2 text-gray-500 hover:text-red-500 transition"
                  title="退出登录"
                >
                  <FiLogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition"
                >
                  注册
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
