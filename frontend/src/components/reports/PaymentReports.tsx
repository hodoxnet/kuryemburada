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
import { Search, Download, CreditCard, Banknote, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PaymentReport {
  payments: any[];
  stats: {
    totalPayments: number;
    totalAmount: number;
    methodBreakdown: Array<{
      paymentMethod: string;
      _count: number;
      _sum: { amount: number };
    }>;
    statusBreakdown: Array<{
      status: string;
      _count: number;
      _sum: { amount: number };
    }>;
  };
}

export default function PaymentReports() {
  const [report, setReport] = useState<PaymentReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');

  const fetchPaymentReport = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (status) params.status = status;

      const response = await apiClient.get('/reports/payments', { params });
      setReport(response.data);
    } catch (error) {
      console.error('Ödeme raporu yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const params: any = {
        reportType: 'payments',
        startDate,
        endDate,
        status,
      };

      const response = await apiClient.get('/reports/export', { params });
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `odeme-raporu-${format(new Date(), 'yyyy-MM-dd')}.json`;
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
    const statusMap: Record<string, { label: string; variant: any; color: string }> = {
      PENDING: { label: 'Bekliyor', variant: 'outline', color: 'text-yellow-600' },
      COMPLETED: { label: 'Tamamlandı', variant: 'default', color: 'text-green-600' },
      FAILED: { label: 'Başarısız', variant: 'destructive', color: 'text-red-600' },
      REFUNDED: { label: 'İade', variant: 'secondary', color: 'text-blue-600' },
    };

    const statusInfo = statusMap[status] || { label: status, variant: 'outline', color: '' };
    return <Badge variant={statusInfo.variant} className={statusInfo.color}>{statusInfo.label}</Badge>;
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'CREDIT_CARD':
        return <CreditCard className="w-4 h-4" />;
      case 'CASH':
        return <Banknote className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const methodMap: Record<string, string> = {
      CASH: 'Nakit',
      CREDIT_CARD: 'Kredi Kartı',
      BANK_TRANSFER: 'Banka Transferi',
    };
    return methodMap[method] || method;
  };

  useEffect(() => {
    fetchPaymentReport();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ödeme Raporları</CardTitle>
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
                  <SelectItem value="COMPLETED">Tamamlandı</SelectItem>
                  <SelectItem value="FAILED">Başarısız</SelectItem>
                  <SelectItem value="REFUNDED">İade</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={fetchPaymentReport}>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Toplam İşlem</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.stats.totalPayments}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Toplam Tutar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(report.stats.totalAmount)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Ortalama İşlem</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(report.stats.totalAmount / report.stats.totalPayments)}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ödeme Yöntemi Dağılımı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report.stats.methodBreakdown.map((item, index) => (
                    <div key={item.paymentMethod} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(item.paymentMethod)}
                          <span className="text-sm font-medium">
                            {getPaymentMethodLabel(item.paymentMethod)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">{item._count} işlem</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${(item._sum.amount / report.stats.totalAmount) * 100}%`,
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {formatCurrency(item._sum.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Durum Dağılımı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report.stats.statusBreakdown.map((item) => (
                    <div key={item.status} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(item.status)}
                        </div>
                        <span className="text-sm text-gray-600">{item._count} işlem</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Toplam:</span>
                        <span className="text-sm font-medium">
                          {formatCurrency(item._sum.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Son Ödemeler</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>İşlem No</TableHead>
                    <TableHead>Sipariş No</TableHead>
                    <TableHead>Firma</TableHead>
                    <TableHead>Yöntem</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">Tutar</TableHead>
                    <TableHead>Tarih</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.payments.slice(0, 10).map((payment: any) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.transactionId || payment.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>{payment.order?.orderNumber || '-'}</TableCell>
                      <TableCell>{payment.order?.company?.name || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(payment.paymentMethod)}
                          {getPaymentMethodLabel(payment.paymentMethod)}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(payment.createdAt), 'dd MMM yyyy HH:mm', { locale: tr })}
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