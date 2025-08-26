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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { Search, Download, Package, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

interface OrderReport {
  orders: any[];
  stats: {
    totalOrders: number;
    averagePrice: number;
    averageDistance: number;
    averageTime: number;
    averageRating: number;
    totalRevenue: number;
    totalCommission: number;
    totalCourierEarnings: number;
    statusBreakdown: Array<{
      status: string;
      _count: number;
    }>;
  };
}

export default function OrderReports() {
  const [report, setReport] = useState<OrderReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [courierId, setCourierId] = useState('');

  const fetchOrderReport = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (status) params.status = status;
      if (companyId) params.companyId = companyId;
      if (courierId) params.courierId = courierId;

      const response = await apiClient.get('/reports/orders', { params });
      setReport(response.data);
    } catch (error) {
      console.error('Sipariş raporu yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const params: any = {
        reportType: 'orders',
        startDate,
        endDate,
        status,
        companyId,
        courierId,
      };

      const response = await apiClient.get('/reports/export', { params });
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `siparis-raporu-${format(new Date(), 'yyyy-MM-dd')}.json`;
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
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: any }> = {
      PENDING: { label: 'Bekliyor', variant: 'outline' },
      ACCEPTED: { label: 'Kabul Edildi', variant: 'default' },
      IN_PROGRESS: { label: 'Yolda', variant: 'default' },
      DELIVERED: { label: 'Teslim Edildi', variant: 'default' },
      CANCELLED: { label: 'İptal', variant: 'destructive' },
      REJECTED: { label: 'Reddedildi', variant: 'destructive' },
    };

    const statusInfo = statusMap[status] || { label: status, variant: 'outline' };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  useEffect(() => {
    fetchOrderReport();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sipariş Raporları</CardTitle>
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
              <Label>Durum</Label>
              <Select value={status || 'all'} onValueChange={(value) => setStatus(value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="PENDING">Bekliyor</SelectItem>
                  <SelectItem value="ACCEPTED">Kabul Edildi</SelectItem>
                  <SelectItem value="IN_PROGRESS">Yolda</SelectItem>
                  <SelectItem value="DELIVERED">Teslim Edildi</SelectItem>
                  <SelectItem value="CANCELLED">İptal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={fetchOrderReport}>
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
      ) : report ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Toplam Sipariş</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.stats.totalOrders}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Toplam Gelir</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(report.stats.totalRevenue)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Ortalama Sipariş</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(report.stats.averagePrice)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Ortalama Mesafe</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {report.stats.averageDistance?.toFixed(1) || 0} km
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Durum Dağılımı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {report.stats.statusBreakdown.map((item: any) => (
                    <div key={item.status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(item.status)}
                      </div>
                      <span className="font-medium">{item._count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Finansal Özet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Toplam Gelir:</span>
                  <span className="font-medium">{formatCurrency(report.stats.totalRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform Komisyonu:</span>
                  <span className="font-medium">{formatCurrency(report.stats.totalCommission)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Kurye Ödemeleri:</span>
                  <span className="font-medium">{formatCurrency(report.stats.totalCourierEarnings)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Net Kar:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(report.stats.totalCommission)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Son Siparişler</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sipariş No</TableHead>
                    <TableHead>Firma</TableHead>
                    <TableHead>Kurye</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">Tutar</TableHead>
                    <TableHead>Tarih</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.orders.slice(0, 10).map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>{order.company?.name || '-'}</TableCell>
                      <TableCell>{order.courier?.fullName || '-'}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(order.price)}</TableCell>
                      <TableCell>
                        {format(new Date(order.createdAt), 'dd MMM yyyy HH:mm', { locale: tr })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}