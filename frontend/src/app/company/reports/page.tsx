'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Calendar,
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek, subWeeks } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';
import reconciliationAPI, { DailyReconciliation, ReconciliationSummary, DailyOrderReport } from '@/lib/api/reconciliation';

export default function CompanyReportsPage() {
  const [loading, setLoading] = useState(true);
  const [ordersReport, setOrdersReport] = useState<DailyOrderReport[]>([]);
  const [reconciliations, setReconciliations] = useState<DailyReconciliation[]>([]);
  const [summary, setSummary] = useState<ReconciliationSummary | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedReport, setSelectedReport] = useState<DailyOrderReport | null>(null);
  const [viewMode, setViewMode] = useState<'orders' | 'reconciliations'>('orders');

  const fetchData = async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      const [ordersData, summaryData] = await Promise.all([
        reconciliationAPI.getCompanyOrdersReport(startDate, endDate),
        reconciliationAPI.getCompanySummary(startDate, endDate),
      ]);
      
      setOrdersReport(ordersData);
      setSummary(summaryData);
      
      // Mutabakatları da getir (opsiyonel)
      try {
        const reconciliationsData = await reconciliationAPI.getCompanyReconciliations(startDate, endDate);
        setReconciliations(reconciliationsData);
      } catch (err) {
        // Mutabakat yoksa hata vermemeli
        setReconciliations([]);
      }
    } catch (error) {
      console.error('Veriler yüklenirken hata:', error);
      toast.error('Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // İlk yüklemede bu ayın verilerini getir
    const start = format(startOfMonth(new Date()), 'yyyy-MM-dd');
    const end = format(endOfMonth(new Date()), 'yyyy-MM-dd');
    fetchData(start, end);
  }, []);

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    let start, end;
    
    switch (period) {
      case 'week':
        start = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
        end = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
        break;
      case 'lastWeek':
        const lastWeek = subWeeks(new Date(), 1);
        start = format(startOfWeek(lastWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        end = format(endOfWeek(lastWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        break;
      case 'month':
        start = format(startOfMonth(new Date()), 'yyyy-MM-dd');
        end = format(endOfMonth(new Date()), 'yyyy-MM-dd');
        break;
      case 'lastMonth':
        const lastMonth = subMonths(new Date(), 1);
        start = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
        end = format(endOfMonth(lastMonth), 'yyyy-MM-dd');
        break;
      case 'custom':
        return;
      default:
        return;
    }
    
    fetchData(start, end);
  };

  const handleCustomDateFilter = () => {
    if (!customStartDate || !customEndDate) {
      toast.error('Lütfen başlangıç ve bitiş tarihlerini seçin');
      return;
    }
    fetchData(customStartDate, customEndDate);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'Beklemede', variant: 'secondary' as const, icon: Clock },
      PAID: { label: 'Ödendi', variant: 'default' as const, icon: CheckCircle },
      PARTIALLY_PAID: { label: 'Kısmi Ödendi', variant: 'outline' as const, icon: AlertCircle },
      OVERDUE: { label: 'Gecikmiş', variant: 'destructive' as const, icon: AlertCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: 'secondary' as const,
      icon: AlertCircle,
    };

    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Raporlar</h1>
          <p className="text-muted-foreground">
            Günlük mutabakatlarınızı ve finansal özetinizi görüntüleyin
          </p>
        </div>
      </div>

      {/* Özet Kartları */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Sipariş</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                {summary.deliveredOrders} teslim, {summary.cancelledOrders} iptal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Tutar</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.totalAmount)}</div>
              <p className="text-xs text-muted-foreground">
                Teslim edilen siparişlerin tutarı
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Borç</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.netAmount)}</div>
              <p className="text-xs text-muted-foreground">
                Platform komisyonu: {formatCurrency(summary.platformCommission)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bekleyen Sipariş</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.pendingOrders || 0}</div>
              <p className="text-xs text-muted-foreground">
                İşlemde: {summary.inProgressOrders || 0}
              </p>
            </CardContent>
          </Card>
        </div>
      )}


      {/* Filtreleme ve Tablo */}
      <Card>
        <CardHeader>
          <CardTitle>Sipariş Raporları</CardTitle>
          <CardDescription>
            Günlük sipariş raporlarınızı görüntüleyin
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Dönem Seçimi */}
          <div className="mb-6">
            <Tabs value={selectedPeriod} onValueChange={handlePeriodChange}>
              <TabsList>
                <TabsTrigger value="week">Bu Hafta</TabsTrigger>
                <TabsTrigger value="lastWeek">Geçen Hafta</TabsTrigger>
                <TabsTrigger value="month">Bu Ay</TabsTrigger>
                <TabsTrigger value="lastMonth">Geçen Ay</TabsTrigger>
                <TabsTrigger value="custom">Özel</TabsTrigger>
              </TabsList>

              <TabsContent value="custom" className="mt-4">
                <div className="flex gap-4 items-end">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Başlangıç Tarihi</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Bitiş Tarihi</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleCustomDateFilter}>
                    Filtrele
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sipariş Rapor Tablosu */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead className="text-center">Sipariş Sayısı</TableHead>
                  <TableHead className="text-center">Teslim</TableHead>
                  <TableHead className="text-center">İptal</TableHead>
                  <TableHead className="text-right">Toplam Tutar</TableHead>
                  <TableHead className="text-right">Kurye Maliyeti</TableHead>
                  <TableHead className="text-right">Platform Komisyonu</TableHead>
                  <TableHead className="text-right">Net Tutar</TableHead>
                  <TableHead className="text-center">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersReport.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Bu dönem için sipariş bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  ordersReport.map((report) => (
                    <TableRow key={report.date}>
                      <TableCell className="font-medium">
                        {format(new Date(report.date), 'dd MMMM yyyy', { locale: tr })}
                      </TableCell>
                      <TableCell className="text-center">
                        {report.totalOrders}
                      </TableCell>
                      <TableCell className="text-center text-green-600">
                        {report.deliveredOrders}
                      </TableCell>
                      <TableCell className="text-center text-red-600">
                        {report.cancelledOrders}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(report.totalAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(report.courierCost)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(report.platformCommission)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(report.netAmount)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedReport(report)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Toplam Satırı */}
          {ordersReport.length > 0 && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Dönem Toplamı:</span>
                <div className="flex gap-8">
                  <div>
                    <span className="text-muted-foreground mr-2">Toplam Tutar:</span>
                    <span className="font-bold">
                      {formatCurrency(ordersReport.reduce((sum, r) => sum + r.totalAmount, 0))}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground mr-2">Net Borç:</span>
                    <span className="font-bold text-lg">
                      {formatCurrency(ordersReport.reduce((sum, r) => sum + r.netAmount, 0))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detay Modal/Dialog yerine detay kartı */}
      {selectedReport && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Günlük Sipariş Detayı</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedReport(null)}
              >
                Kapat
              </Button>
            </div>
            <CardDescription>
              {format(new Date(selectedReport.date), 'dd MMMM yyyy', { locale: tr })} tarihli siparişler
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Toplam Sipariş:</span>
                  <span className="font-medium">{selectedReport.totalOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Teslim Edilen:</span>
                  <span className="font-medium text-green-600">{selectedReport.deliveredOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">İptal Edilen:</span>
                  <span className="font-medium text-red-600">{selectedReport.cancelledOrders}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Toplam Tutar:</span>
                  <span className="font-medium">{formatCurrency(selectedReport.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kurye Maliyeti:</span>
                  <span className="font-medium">{formatCurrency(selectedReport.courierCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Komisyonu:</span>
                  <span className="font-medium">{formatCurrency(selectedReport.platformCommission)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Net Tutar:</span>
                  <span className="font-bold text-lg">{formatCurrency(selectedReport.netAmount)}</span>
                </div>
              </div>
            </div>
            
            {/* Mutabakat Oluştur Butonu */}
            <div className="mt-6 p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Bu gün için mutabakat oluştur</p>
                  <p className="text-sm text-muted-foreground">
                    Gün sonu mutabakatı oluşturarak ödeme takibi yapabilirsiniz
                  </p>
                </div>
                <Button 
                  onClick={() => {
                    toast.info('Mutabakat oluşturma özelliği yakında eklenecek');
                  }}
                >
                  Mutabakat Oluştur
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}