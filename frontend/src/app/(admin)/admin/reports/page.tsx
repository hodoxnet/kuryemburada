'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  Package,
  DollarSign,
  Users,
  Clock,
  MapPin,
  Calendar,
  Download,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';

interface OverviewData {
  overview: {
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    completionRate: number;
    totalRevenue: number;
    totalCommission: number;
    netRevenue: number;
    avgDeliveryTime: number;
  };
  users: {
    activeCompanies: number;
    activeCouriers: number;
    newCompanies: number;
    newCouriers: number;
  };
  topPerformers: {
    companies: Array<{
      id: number;
      name: string;
      orderCount: number;
    }>;
    couriers: Array<{
      id: number;
      name: string;
      deliveryCount: number;
    }>;
  };
}

interface RevenueData {
  summary: {
    totalRevenue: number;
    totalPayments: number;
    avgPaymentAmount: number;
    totalCommission: number;
    netRevenue: number;
  };
  byPaymentMethod: Array<{
    method: string;
    count: number;
    amount: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    payment_count: number;
    revenue: number;
  }>;
  topCompanies: Array<{
    id: number;
    name: string;
    order_count: number;
    total_revenue: number;
  }>;
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'revenue' | 'performance'>('overview');
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [performanceData, setPerformanceData] = useState<any>(null);

  useEffect(() => {
    fetchReports();
  }, [dateRange, activeTab]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'overview') {
        const response = await apiClient.get('/reports/admin/overview', {
          params: dateRange,
        });
        setOverviewData(response.data);
      } else if (activeTab === 'revenue') {
        const response = await apiClient.get('/reports/admin/revenue', {
          params: dateRange,
        });
        setRevenueData(response.data);
      } else if (activeTab === 'orders') {
        const response = await apiClient.get('/reports/admin/orders', {
          params: dateRange,
        });
        setOrderData(response.data);
      } else if (activeTab === 'performance') {
        const response = await apiClient.get('/reports/admin/performance', {
          params: dateRange,
        });
        setPerformanceData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
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

  const exportToCSV = () => {
    // Implementation for CSV export
    console.log('Exporting to CSV...');
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const renderOverviewTab = () => {
    if (!overviewData) return null;

    const orderStatusData = [
      { name: 'Tamamlanan', value: overviewData.overview.completedOrders },
      { name: 'İptal', value: overviewData.overview.cancelledOrders },
      { name: 'Devam Eden', value: overviewData.overview.totalOrders - overviewData.overview.completedOrders - overviewData.overview.cancelledOrders },
    ];

    return (
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam Sipariş</p>
                <p className="text-2xl font-bold mt-1">
                  {formatNumber(overviewData.overview.totalOrders)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  %{overviewData.overview.completionRate.toFixed(1)} tamamlanma
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam Gelir</p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(overviewData.overview.totalRevenue)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Komisyon: {formatCurrency(overviewData.overview.totalCommission)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 text-green-600">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktif Kullanıcılar</p>
                <p className="text-2xl font-bold mt-1">
                  {overviewData.users.activeCompanies + overviewData.users.activeCouriers}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {overviewData.users.activeCompanies} firma, {overviewData.users.activeCouriers} kurye
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ort. Teslimat Süresi</p>
                <p className="text-2xl font-bold mt-1">
                  {overviewData.overview.avgDeliveryTime} dk
                </p>
                <p className="text-xs text-gray-500 mt-1">Son 30 gün</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Status Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Sipariş Durumu Dağılımı</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top Performers */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">En İyi Performans</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Top Firmalar</h4>
                <div className="space-y-2">
                  {overviewData.topPerformers.companies.map((company, index) => (
                    <div key={company.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900 mr-2">
                          {index + 1}.
                        </span>
                        <span className="text-sm text-gray-700">{company.name}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {company.orderCount} sipariş
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Top Kuryeler</h4>
                <div className="space-y-2">
                  {overviewData.topPerformers.couriers.map((courier, index) => (
                    <div key={courier.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900 mr-2">
                          {index + 1}.
                        </span>
                        <span className="text-sm text-gray-700">{courier.name}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {courier.deliveryCount} teslimat
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRevenueTab = () => {
    if (!revenueData) return null;

    const paymentMethodData = revenueData.byPaymentMethod.map(item => ({
      name: item.method,
      amount: item.amount,
      count: item.count,
    }));

    const monthlyData = revenueData.monthlyTrend.map(item => ({
      month: new Date(item.month).toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' }),
      revenue: item.revenue,
      count: item.payment_count,
    }));

    return (
      <div className="space-y-6">
        {/* Revenue Summary */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Toplam Gelir</p>
            <p className="text-xl font-bold mt-1">{formatCurrency(revenueData.summary.totalRevenue)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Toplam İşlem</p>
            <p className="text-xl font-bold mt-1">{formatNumber(revenueData.summary.totalPayments)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Ort. İşlem</p>
            <p className="text-xl font-bold mt-1">{formatCurrency(revenueData.summary.avgPaymentAmount)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Komisyon</p>
            <p className="text-xl font-bold mt-1">{formatCurrency(revenueData.summary.totalCommission)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Net Gelir</p>
            <p className="text-xl font-bold mt-1">{formatCurrency(revenueData.summary.netRevenue)}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Revenue Trend */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Aylık Gelir Trendi</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Ödeme Yöntemleri</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={paymentMethodData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="amount" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Companies by Revenue */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">En Çok Gelir Getiren Firmalar</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sıra
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Firma Adı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sipariş Sayısı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Toplam Gelir
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {revenueData.topCompanies.map((company, index) => (
                  <tr key={company.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {company.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {formatNumber(company.order_count)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(company.total_revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderOrdersTab = () => {
    if (!orderData) return null;

    const dailyTrendData = orderData.dailyTrend?.map((item: any) => ({
      date: new Date(item.date).toLocaleDateString('tr-TR'),
      count: parseInt(item.count),
      revenue: parseFloat(item.revenue),
    })) || [];

    return (
      <div className="space-y-6">
        {/* Order Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {orderData.statistics?.byStatus?.map((stat: any) => (
            <div key={stat.status} className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">{stat.status}</p>
              <p className="text-xl font-bold mt-1">{formatNumber(stat.count)} sipariş</p>
            </div>
          ))}
        </div>

        {/* Daily Order Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Günlük Sipariş Trendi</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="count" stroke="#3B82F6" name="Sipariş Sayısı" />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10B981" name="Gelir (TL)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Son Siparişler</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sipariş No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Firma
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kurye
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tutar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orderData.orders?.slice(0, 10).map((order: any) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {order.company?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {order.courier?.fullName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(order.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderPerformanceTab = () => {
    if (!performanceData) return null;

    return (
      <div className="space-y-6">
        {/* Average Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Ort. Sipariş Değeri</p>
            <p className="text-xl font-bold mt-1">
              {formatCurrency(performanceData.averageMetrics?.avgOrderValue || 0)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Ort. Teslimat Süresi</p>
            <p className="text-xl font-bold mt-1">
              {performanceData.averageMetrics?.avgDeliveryTime || 0} dk
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Ort. Mesafe</p>
            <p className="text-xl font-bold mt-1">
              {performanceData.averageMetrics?.avgDistance || 0} km
            </p>
          </div>
        </div>

        {/* Courier Performance Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Kurye Performansları</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kurye
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Toplam
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tamamlanan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İptal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ort. Süre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Puan
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {performanceData.courierPerformance?.map((courier: any) => (
                  <tr key={courier.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {courier.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {courier.total_orders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {courier.completed_orders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {courier.cancelled_orders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {courier.avg_delivery_time ? `${Math.round(courier.avg_delivery_time)} dk` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {courier.avg_rating ? courier.avg_rating.toFixed(1) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Company Activity Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Firma Aktiviteleri</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Firma
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sipariş Sayısı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ort. Sipariş
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Toplam Harcama
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {performanceData.companyActivity?.map((company: any) => (
                  <tr key={company.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {company.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {company.total_orders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {formatCurrency(company.avg_order_value || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(company.total_spent || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Raporlar</h1>
          <p className="text-gray-600">Detaylı analiz ve raporlar</p>
        </div>
        
        <div className="flex space-x-3">
          {/* Date Range Selector */}
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-gray-300">
            <Calendar className="h-4 w-4 text-gray-500" />
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="border-0 focus:ring-0 text-sm"
            />
            <span className="text-gray-500">-</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="border-0 focus:ring-0 text-sm"
            />
          </div>

          <button
            onClick={exportToCSV}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="h-4 w-4 mr-2" />
            CSV İndir
          </button>

          <button
            onClick={fetchReports}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-6 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Genel Bakış
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-2 px-6 text-sm font-medium ${
                activeTab === 'orders'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Siparişler
            </button>
            <button
              onClick={() => setActiveTab('revenue')}
              className={`py-2 px-6 text-sm font-medium ${
                activeTab === 'revenue'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Gelir
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`py-2 px-6 text-sm font-medium ${
                activeTab === 'performance'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Performans
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'orders' && renderOrdersTab()}
          {activeTab === 'revenue' && renderRevenueTab()}
          {activeTab === 'performance' && renderPerformanceTab()}
        </div>
      </div>
    </div>
  );
}