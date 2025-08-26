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
import { Search, Download, TrendingUp, Star, Clock, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Courier {
  id: string;
  fullName: string;
  status: string;
}

interface CourierPerformance {
  courierId: string;
  courierName: string;
  totalOrders: number;
  deliveredOrders: number;
  completionRate: number;
  totalEarnings: number;
  averageRating: number;
  averageDeliveryTime: number;
}

interface CourierEarnings {
  groupedData: Array<{
    date: string;
    deliveryCount: number;
    earnings: number;
    tips: number;
    totalAmount: number;
  }>;
  summary: {
    totalDeliveries: number;
    totalEarnings: number;
    totalTips: number;
    totalAmount: number;
    averageEarningPerDelivery: number;
  };
  recentOrders: any[];
}

export default function CourierReports() {
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [selectedCourier, setSelectedCourier] = useState<string>('');
  const [performanceReport, setPerformanceReport] = useState<CourierPerformance[]>([]);
  const [earningsReport, setEarningsReport] = useState<CourierEarnings | null>(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');
  const [activeTab, setActiveTab] = useState('performance');

  useEffect(() => {
    fetchCouriers();
  }, []);

  useEffect(() => {
    if (activeTab === 'performance') {
      fetchCourierPerformance();
    }
  }, [activeTab]);

  const fetchCouriers = async () => {
    try {
      const response = await apiClient.get('/couriers?take=100');
      setCouriers(response.data.data); // paginated response olduğu için data.data
    } catch (error) {
      console.error('Kuryeler yüklenemedi:', error);
    }
  };

  const fetchCourierPerformance = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (selectedCourier && selectedCourier !== 'all') params.courierId = selectedCourier;

      const response = await apiClient.get('/reports/courier-performance', { params });
      setPerformanceReport(response.data);
    } catch (error) {
      console.error('Kurye performans raporu yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourierEarnings = async () => {
    if (!selectedCourier || selectedCourier === 'all') {
      alert('Lütfen bir kurye seçin');
      return;
    }
    
    try {
      setLoading(true);
      const params: any = { groupBy };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await apiClient.get(`/reports/courier-earnings/${selectedCourier}`, { params });
      setEarningsReport(response.data);
    } catch (error) {
      console.error('Kurye kazanç raporu yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const params: any = {
        reportType: activeTab === 'performance' ? 'courier-performance' : 'courier-earnings',
        startDate,
        endDate,
        courierId: selectedCourier !== 'all' ? selectedCourier : undefined,
      };

      const response = await apiClient.get('/reports/export', { params });
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `kurye-raporu-${format(new Date(), 'yyyy-MM-dd')}.json`;
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

  const getRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-4 h-4 text-yellow-500 fill-current" />
        ))}
        {hasHalfStar && <Star className="w-4 h-4 text-yellow-500 fill-current opacity-50" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Kurye Raporları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Kurye Seç</Label>
              <Select value={selectedCourier} onValueChange={setSelectedCourier}>
                <SelectTrigger>
                  <SelectValue placeholder="Kurye seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kuryeler</SelectItem>
                  {couriers.map((courier) => (
                    <SelectItem key={courier.id} value={courier.id}>
                      {courier.fullName}
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
                if (activeTab === 'performance') fetchCourierPerformance();
                else if (activeTab === 'earnings') fetchCourierEarnings();
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
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="performance">Performans Analizi</TabsTrigger>
          <TabsTrigger value="earnings">Kazanç Detayları</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="mt-6">
          {loading ? (
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-96" />
              </CardContent>
            </Card>
          ) : performanceReport.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kurye</TableHead>
                      <TableHead className="text-center">Toplam Sipariş</TableHead>
                      <TableHead className="text-center">Teslim Edilen</TableHead>
                      <TableHead className="text-center">Tamamlama %</TableHead>
                      <TableHead className="text-center">Ortalama Puan</TableHead>
                      <TableHead className="text-center">Ort. Teslimat Süresi</TableHead>
                      <TableHead className="text-right">Toplam Kazanç</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {performanceReport.map((courier) => (
                      <TableRow key={courier.courierId}>
                        <TableCell className="font-medium">{courier.courierName}</TableCell>
                        <TableCell className="text-center">{courier.totalOrders}</TableCell>
                        <TableCell className="text-center">{courier.deliveredOrders}</TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant={courier.completionRate > 90 ? "default" : courier.completionRate > 70 ? "outline" : "destructive"}
                            className={
                              courier.completionRate > 90 ? "bg-green-600" : 
                              courier.completionRate > 70 ? "" : ""
                            }
                          >
                            %{courier.completionRate.toFixed(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {getRatingStars(courier.averageRating)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            <Clock className="w-4 h-4 mr-1 text-gray-500" />
                            {courier.averageDeliveryTime.toFixed(0)} dk
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(courier.totalEarnings)}
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

        <TabsContent value="earnings" className="mt-6">
          {loading ? (
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-96" />
              </CardContent>
            </Card>
          ) : earningsReport ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Toplam Teslimat</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{earningsReport.summary.totalDeliveries}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Toplam Kazanç</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(earningsReport.summary.totalEarnings)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Ortalama Kazanç</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(earningsReport.summary.averageEarningPerDelivery)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Teslimat başına</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tarih</TableHead>
                        <TableHead className="text-center">Teslimat Sayısı</TableHead>
                        <TableHead className="text-right">Kazanç</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {earningsReport.groupedData.map((data) => (
                        <TableRow key={data.date}>
                          <TableCell className="font-medium">
                            {format(new Date(data.date), 'dd MMM yyyy', { locale: tr })}
                          </TableCell>
                          <TableCell className="text-center">{data.deliveryCount}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(data.earnings)}
                          </TableCell>
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
                Lütfen bir kurye seçin ve rapor oluşturun
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}