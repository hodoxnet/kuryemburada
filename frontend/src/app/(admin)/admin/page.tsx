'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import {
  Users,
  Building2,
  Bike,
  Package,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  recentUsers: number;
  byRole: Record<string, number>;
  byStatus: Record<string, number>;
  companies: {
    total: number;
    pending: number;
  };
  couriers: {
    total: number;
    pending: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/admin/users/statistics/overview');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Sistem genel durumu ve istatistikler</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Toplam Kullanıcı"
          value={stats?.totalUsers || 0}
          icon={Users}
          color="blue"
          subtitle={`Son 7 günde: ${stats?.recentUsers || 0}`}
        />
        <StatCard
          title="Toplam Firma"
          value={stats?.companies.total || 0}
          icon={Building2}
          color="green"
          subtitle={`Onay bekleyen: ${stats?.companies.pending || 0}`}
        />
        <StatCard
          title="Toplam Kurye"
          value={stats?.couriers.total || 0}
          icon={Bike}
          color="purple"
          subtitle={`Onay bekleyen: ${stats?.couriers.pending || 0}`}
        />
        <StatCard
          title="Aktif Siparişler"
          value={0}
          icon={Package}
          color="orange"
          subtitle="Şu an teslimatta"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Hızlı İşlemler</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickAction
            title="Onay Bekleyen Firmalar"
            count={stats?.companies.pending || 0}
            href="/admin/companies?status=PENDING"
            icon={AlertCircle}
            color="yellow"
          />
          <QuickAction
            title="Onay Bekleyen Kuryeler"
            count={stats?.couriers.pending || 0}
            href="/admin/couriers?status=PENDING"
            icon={AlertCircle}
            color="yellow"
          />
          <QuickAction
            title="Bekleyen Ödemeler"
            count={0}
            href="/admin/payments?status=PENDING"
            icon={Clock}
            color="red"
          />
        </div>
      </div>

      {/* User Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Kullanıcı Rolleri</h2>
          <div className="space-y-3">
            {Object.entries(stats?.byRole || {}).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between">
                <span className="text-gray-600">{role}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Kullanıcı Durumları</h2>
          <div className="space-y-3">
            {Object.entries(stats?.byStatus || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {status === 'ACTIVE' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : status === 'PENDING' ? (
                    <Clock className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-gray-600">{status}</span>
                </div>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
  subtitle?: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  }[color];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  title,
  count,
  href,
  icon: Icon,
  color,
}: {
  title: string;
  count: number;
  href: string;
  icon: any;
  color: string;
}) {
  const colorClasses = {
    yellow: 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200',
    red: 'bg-red-100 text-red-600 hover:bg-red-200',
  }[color];

  return (
    <a
      href={href}
      className={`flex items-center justify-between p-4 rounded-lg transition-colors ${colorClasses}`}
    >
      <div className="flex items-center space-x-3">
        <Icon className="h-5 w-5" />
        <span className="font-medium">{title}</span>
      </div>
      <span className="text-xl font-bold">{count}</span>
    </a>
  );
}