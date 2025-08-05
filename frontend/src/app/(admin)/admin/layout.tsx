'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { ProtectedRoute } from '@/components/auth/protected-route';
import {
  LayoutDashboard,
  Building2,
  Bike,
  CreditCard,
  Settings,
  Users,
  Menu,
  X,
  LogOut,
  DollarSign,
  FileText,
} from 'lucide-react';

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Firmalar',
    href: '/admin/companies',
    icon: Building2,
  },
  {
    title: 'Kuryeler',
    href: '/admin/couriers',
    icon: Bike,
  },
  {
    title: 'Kullanıcılar',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Fiyatlandırma',
    href: '/admin/pricing',
    icon: DollarSign,
  },
  {
    title: 'Ödemeler',
    href: '/admin/payments',
    icon: CreditCard,
  },
  {
    title: 'Raporlar',
    href: '/admin/reports',
    icon: FileText,
  },
  {
    title: 'Sistem Ayarları',
    href: '/admin/settings',
    icon: Settings,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:static lg:inset-0`}
        >
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center justify-between px-4 border-b">
              <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 rounded-lg px-3 py-2 transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User info */}
            <div className="border-t p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.email}
                  </p>
                  <p className="text-xs text-gray-500">Süper Admin</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="lg:ml-64">
          {/* Top bar */}
          <header className="sticky top-0 z-30 bg-white shadow-sm">
            <div className="flex h-16 items-center justify-between px-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-6 w-6" />
              </button>

              <h1 className="text-xl font-semibold text-gray-800">
                Kurye Operasyon Sistemi
              </h1>

              <div className="flex items-center space-x-4">
                {/* Add notification bell, profile dropdown etc. here */}
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}