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
import { Search, Download, Filter, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Company {
  id: string;
  name: string;
  status: string;
}

interface CompanyBalance {
  companyId: string;
  companyName: string;
  currentDebt: number;
  lastPaymentDate: string | null;
  lastPaymentAmount: number;
  status: 'HIGH_DEBT' | 'HAS_DEBT' | 'CLEAR';
}

interface CompanyActivity {
  companyId: string;
  companyName: string;
  totalOrders: number;
  totalSpent: number;
  paidAmount: number;
  outstandingAmount: number;
  orderStatusBreakdown: Record<string, number>;
}

export default function CompanyReports() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [balanceReport, setBalanceReport] = useState<any>(null);
  const [activityReport, setActivityReport] = useState<CompanyActivity[]>([]);
  const [detailedReport, setDetailedReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');
  const [activeTab, setActiveTab] = useState('balance');

  useEffect(() => {
    fetchCompanies();
    if (activeTab === 'balance') {
      fetchAllCompaniesBalance();
    }
  }, [activeTab]);

  const fetchCompanies = async () => {
    try {
      const response = await apiClient.get('/companies?take=100');
      setCompanies(response.data.data); // paginated response olduğu için data.data
    } catch (error) {
      console.error('Firmalar yüklenemedi:', error);
    }
  };

  const fetchAllCompaniesBalance = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/reports/all-companies-balance');
      setBalanceReport(response.data);
    } catch (error) {
      console.error('Firma cari durumları yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyActivity = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (selectedCompany) params.companyId = selectedCompany;

      const response = await apiClient.get('/reports/company-activity', { params });
      setActivityReport(response.data);
    } catch (error) {
      console.error('Firma aktivite raporu yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyDetailedReport = async () => {
    if (!selectedCompany) return;
    
    try {
      setLoading(true);
      const params: any = { groupBy };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await apiClient.get(`/reports/company-detailed/${selectedCompany}`, { params });
      setDetailedReport(response.data);
    } catch (error) {
      console.error('Firma detaylı raporu yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const params: any = {
        reportType: 'company-activity',
        startDate,
        endDate,
        companyId: selectedCompany,
      };

      const response = await apiClient.get('/reports/export', { params });
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `firma-raporu-${format(new Date(), 'yyyy-MM-dd')}.json`;
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
    switch (status) {
      case 'HIGH_DEBT':
        return <Badge variant="destructive">Yüksek Borç</Badge>;
      case 'HAS_DEBT':
        return <Badge variant="outline" className="text-orange-600">Borçlu</Badge>;
      case 'CLEAR':
        return <Badge variant="default" className="bg-green-600">Temiz</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Firma Raporları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Firma Seç</Label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="Firma seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Firmalar</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
            <Button 
              onClick={() => {
                if (activeTab === 'balance') fetchAllCompaniesBalance();
                else if (activeTab === 'activity') fetchCompanyActivity();
                else if (activeTab === 'detailed') fetchCompanyDetailedReport();
              }}
            >
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="balance">Cari Durumlar</TabsTrigger>
          <TabsTrigger value="activity">Firma Aktiviteleri</TabsTrigger>
          <TabsTrigger value="detailed">Detaylı Rapor</TabsTrigger>
        </TabsList>

        <TabsContent value="balance" className="mt-6">
          {loading ? (
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-96" />
              </CardContent>
            </Card>
          ) : balanceReport ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Toplam Borç</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(balanceReport.summary.totalDebt)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Borçlu Firma Sayısı</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {balanceReport.summary.companiesWithDebt}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Ortalama Borç</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(balanceReport.summary.averageDebt)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Firma</TableHead>
                        <TableHead>Mevcut Borç</TableHead>
                        <TableHead>Son Ödeme</TableHead>
                        <TableHead>Son Ödeme Tutarı</TableHead>
                        <TableHead>Durum</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {balanceReport.companies.map((company: CompanyBalance) => (
                        <TableRow key={company.companyId}>
                          <TableCell className="font-medium">{company.companyName}</TableCell>
                          <TableCell>{formatCurrency(company.currentDebt)}</TableCell>
                          <TableCell>
                            {company.lastPaymentDate
                              ? format(new Date(company.lastPaymentDate), 'dd MMM yyyy', { locale: tr })
                              : '-'}
                          </TableCell>
                          <TableCell>{formatCurrency(company.lastPaymentAmount)}</TableCell>
                          <TableCell>{getStatusBadge(company.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          ) : null}
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          {loading ? (
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-96" />
              </CardContent>
            </Card>
          ) : activityReport.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Firma</TableHead>
                      <TableHead className="text-center">Toplam Sipariş</TableHead>
                      <TableHead className="text-right">Toplam Harcama</TableHead>
                      <TableHead className="text-right">Ödenen</TableHead>
                      <TableHead className="text-right">Kalan Borç</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activityReport.map((company) => (
                      <TableRow key={company.companyId}>
                        <TableCell className="font-medium">{company.companyName}</TableCell>
                        <TableCell className="text-center">{company.totalOrders}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(company.totalSpent)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(company.paidAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={company.outstandingAmount > 0 ? 'text-red-600 font-medium' : ''}>
                            {formatCurrency(company.outstandingAmount)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                Rapor gösterilecek veri bulunamadı
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="detailed" className="mt-6">
          {loading ? (
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-96" />
              </CardContent>
            </Card>
          ) : detailedReport ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Toplam Sipariş</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{detailedReport.summary.totalOrders}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Toplam Tutar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(detailedReport.summary.totalAmount)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Ödenen</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(detailedReport.summary.totalPaid)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Teslim Oranı</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      %{((detailedReport.summary.deliveredCount / detailedReport.summary.totalOrders) * 100).toFixed(1)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tarih</TableHead>
                        <TableHead className="text-center">Sipariş Sayısı</TableHead>
                        <TableHead className="text-center">Teslim Edilen</TableHead>
                        <TableHead className="text-center">İptal</TableHead>
                        <TableHead className="text-right">Toplam Tutar</TableHead>
                        <TableHead className="text-right">Ödenen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailedReport.groupedData.map((data: any) => (
                        <TableRow key={data.date}>
                          <TableCell className="font-medium">
                            {format(new Date(data.date), 'dd MMM yyyy', { locale: tr })}
                          </TableCell>
                          <TableCell className="text-center">{data.totalOrders}</TableCell>
                          <TableCell className="text-center">{data.deliveredOrders}</TableCell>
                          <TableCell className="text-center">{data.cancelledOrders}</TableCell>
                          <TableCell className="text-right">{formatCurrency(data.totalAmount)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(data.paidAmount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                Lütfen bir firma seçin ve rapor oluşturun
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}