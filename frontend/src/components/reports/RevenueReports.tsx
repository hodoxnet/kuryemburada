'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiClient } from '@/lib/api-client';
import { Search, Download, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

interface RevenueData {
  date: string;
  revenue: number;
  orderCount: number;
  averageOrderValue: number;
}

export default function RevenueReports() {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');

  const fetchRevenueReport = async () => {
    try {
      setLoading(true);
      const params: any = { groupBy };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await apiClient.get('/reports/revenue', { params });
      setRevenueData(response.data);
    } catch (error) {
      console.error('Gelir raporu yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const params: any = {
        reportType: 'revenue',
        startDate,
        endDate,
        groupBy,
      };

      const response = await apiClient.get('/reports/export', { params });
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `gelir-raporu-${format(new Date(), 'yyyy-MM-dd')}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error('Rapor dışa aktarılamadı:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateLabel = (date: string) => {
    const dateObj = new Date(date);
    switch (groupBy) {
      case 'day':
        return format(dateObj, 'dd MMM', { locale: tr });
      case 'week':
        return format(dateObj, 'dd MMM', { locale: tr });
      case 'month':
        return format(dateObj, 'MMM yyyy', { locale: tr });
      default:
        return date;
    }
  };

  const calculateTrend = () => {
    if (revenueData.length < 2) return null;
    
    const firstHalf = revenueData.slice(0, Math.floor(revenueData.length / 2));
    const secondHalf = revenueData.slice(Math.floor(revenueData.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.revenue, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.revenue, 0) / secondHalf.length;
    
    const percentChange = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
    
    return {
      trend: secondHalfAvg > firstHalfAvg ? 'up' : 'down',
      percentChange: Math.abs(percentChange),
    };
  };

  const calculateStats = () => {
    if (revenueData.length === 0) return null;
    
    const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
    const totalOrders = revenueData.reduce((sum, d) => sum + d.orderCount, 0);
    const avgOrderValue = totalRevenue / totalOrders;
    const avgDailyRevenue = totalRevenue / revenueData.length;
    
    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      avgDailyRevenue,
    };
  };

  useEffect(() => {
    fetchRevenueReport();
  }, []);

  const trend = calculateTrend();
  const stats = calculateStats();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gelir Analizi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Başlangıç Tarihi</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Bitiş Tarihi</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Gruplama</Label>
              <Select value={groupBy} onValueChange={(value: any) => setGroupBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Günlük</SelectItem>
                  <SelectItem value="week">Haftalık</SelectItem>
                  <SelectItem value="month">Aylık</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={fetchRevenueReport}>
              <Search className="w-4 h-4 mr-2" />
              Rapor Oluştur
            </Button>
            <Button variant="outline" onClick={exportReport}>
              <Download className="w-4 h-4 mr-2" />
              Excel İndir
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-96" />
          </CardContent>
        </Card>
      ) : revenueData.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Toplam Gelir</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats?.totalRevenue || 0)}
                </div>
                {trend && (
                  <div className="flex items-center mt-2">
                    {trend.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                    )}
                    <span className={`text-sm ${trend.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      %{trend.percentChange.toFixed(1)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Toplam Sipariş</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
                <p className="text-xs text-gray-500 mt-1">
                  Ortalama {(stats?.totalOrders || 0) / (revenueData.length || 1)} sipariş/{groupBy === 'day' ? 'gün' : groupBy === 'week' ? 'hafta' : 'ay'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Ortalama Sipariş Değeri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats?.avgOrderValue || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Ortalama {groupBy === 'day' ? 'Günlük' : groupBy === 'week' ? 'Haftalık' : 'Aylık'} Gelir</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats?.avgDailyRevenue || 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Gelir Trendi</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDateLabel}
                  />
                  <YAxis 
                    tickFormatter={(value) => `₺${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip 
                    formatter={(value: any) => formatCurrency(value)}
                    labelFormatter={(label) => formatDateLabel(label)}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8884d8" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)"
                    name="Gelir"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sipariş Sayısı Trendi</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDateLabel}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(label) => formatDateLabel(label)}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="orderCount" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      name="Sipariş Sayısı"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ortalama Sipariş Değeri Trendi</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDateLabel}
                    />
                    <YAxis 
                      tickFormatter={(value) => `₺${value}`}
                    />
                    <Tooltip 
                      formatter={(value: any) => formatCurrency(value)}
                      labelFormatter={(label) => formatDateLabel(label)}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="averageOrderValue" 
                      stroke="#ffc658" 
                      strokeWidth={2}
                      name="Ort. Sipariş Değeri"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detaylı Veri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Tarih</th>
                      <th className="text-right py-2">Gelir</th>
                      <th className="text-right py-2">Sipariş Sayısı</th>
                      <th className="text-right py-2">Ort. Sipariş Değeri</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueData.map((data) => (
                      <tr key={data.date} className="border-b">
                        <td className="py-2">{formatDateLabel(data.date)}</td>
                        <td className="text-right py-2">{formatCurrency(data.revenue)}</td>
                        <td className="text-right py-2">{data.orderCount}</td>
                        <td className="text-right py-2">{formatCurrency(data.averageOrderValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="p-12 text-center text-gray-500">
            Rapor gösterilecek veri bulunamadı. Lütfen tarih aralığı seçin ve rapor oluşturun.
          </CardContent>
        </Card>
      )}
    </div>
  );
}