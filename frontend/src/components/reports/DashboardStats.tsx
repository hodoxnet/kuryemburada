'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { Building2, Bike, Package, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardStats {
  companies: {
    total: number;
    active: number;
  };
  couriers: {
    total: number;
    active: number;
  };
  orders: {
    total: number;
    pending: number;
    delivered: number;
    deliveryRate: number;
  };
  revenue: {
    total: number;
  };
}

export default function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/reports/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Dashboard istatistikleri yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('tr-TR').format(num);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-32 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: 'Toplam Firma',
      value: formatNumber(stats.companies.total),
      subtitle: `${stats.companies.active} aktif`,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Toplam Kurye',
      value: formatNumber(stats.couriers.total),
      subtitle: `${stats.couriers.active} aktif`,
      icon: Bike,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Toplam Sipariş',
      value: formatNumber(stats.orders.total),
      subtitle: `${stats.orders.pending} bekliyor`,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Teslimat Oranı',
      value: `%${stats.orders.deliveryRate.toFixed(1)}`,
      subtitle: `${stats.orders.delivered} teslim edildi`,
      icon: stats.orders.deliveryRate > 80 ? TrendingUp : TrendingDown,
      color: stats.orders.deliveryRate > 80 ? 'text-green-600' : 'text-red-600',
      bgColor: stats.orders.deliveryRate > 80 ? 'bg-green-100' : 'bg-red-100',
    },
    {
      title: 'Toplam Gelir',
      value: formatCurrency(stats.revenue.total),
      subtitle: 'Tamamlanan ödemeler',
      icon: DollarSign,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Genel Özet</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}