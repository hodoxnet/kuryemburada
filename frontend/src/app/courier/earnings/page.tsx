"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/shared/LoadingState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Package,
  Clock,
  Download,
  Eye,
  BarChart3,
  PieChart
} from "lucide-react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths } from "date-fns";
import { tr } from "date-fns/locale";
import { orderService } from "@/lib/api/order.service";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EarningsData {
  period: string;
  deliveries: number;
  earnings: number;
  averagePerDelivery: number;
  totalDistance?: number;
}

interface EarningsStats {
  todayEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  totalEarnings: number;
  completedDeliveries: number;
  averagePerDelivery: number;
  bestDay?: {
    date: string;
    earnings: number;
    deliveries: number;
  };
}

export default function CourierEarnings() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [timePeriod, setTimePeriod] = useState("week");
  const [stats, setStats] = useState<EarningsStats>({
    todayEarnings: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0,
    totalEarnings: 0,
    completedDeliveries: 0,
    averagePerDelivery: 0
  });
  const [earningsHistory, setEarningsHistory] = useState<EarningsData[]>([]);
  const [topEarningDays, setTopEarningDays] = useState<EarningsData[]>([]);

  useEffect(() => {
    loadEarningsData();
  }, []);

  const loadEarningsData = async () => {
    try {
      setLoading(true);
      
      // Kurye siparişlerini ve istatistikleri getir
      const [ordersResponse, statisticsResponse] = await Promise.all([
        orderService.getCourierOrders({ status: 'DELIVERED' }),
        orderService.getCourierStatistics()
      ]);

      const deliveredOrders = Array.isArray(ordersResponse) ? ordersResponse : [];
      
      // Temel istatistikleri hesapla
      const totalEarnings = deliveredOrders.reduce((sum, order) => 
        sum + (order.courierEarning || order.price), 0
      );
      
      const completedDeliveries = deliveredOrders.length;
      const averagePerDelivery = completedDeliveries > 0 ? totalEarnings / completedDeliveries : 0;

      // Bugün, bu hafta ve bu ay kazançları
      const now = new Date();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const monthStart = startOfMonth(now);

      const todayEarnings = deliveredOrders
        .filter(order => new Date(order.deliveredAt) >= todayStart)
        .reduce((sum, order) => sum + (order.courierEarning || order.price), 0);

      const weeklyEarnings = deliveredOrders
        .filter(order => new Date(order.deliveredAt) >= weekStart)
        .reduce((sum, order) => sum + (order.courierEarning || order.price), 0);

      const monthlyEarnings = deliveredOrders
        .filter(order => new Date(order.deliveredAt) >= monthStart)
        .reduce((sum, order) => sum + (order.courierEarning || order.price), 0);

      // En iyi günü bul
      const dailyEarnings = new Map();
      deliveredOrders.forEach(order => {
        const date = format(new Date(order.deliveredAt), 'yyyy-MM-dd');
        if (!dailyEarnings.has(date)) {
          dailyEarnings.set(date, { earnings: 0, deliveries: 0 });
        }
        const dayData = dailyEarnings.get(date);
        dayData.earnings += order.courierEarning || order.price;
        dayData.deliveries += 1;
      });

      let bestDay;
      let maxEarnings = 0;
      for (const [date, data] of dailyEarnings.entries()) {
        if (data.earnings > maxEarnings) {
          maxEarnings = data.earnings;
          bestDay = {
            date,
            earnings: data.earnings,
            deliveries: data.deliveries
          };
        }
      }

      setStats({
        todayEarnings,
        weeklyEarnings,
        monthlyEarnings,
        totalEarnings,
        completedDeliveries,
        averagePerDelivery,
        bestDay
      });

      // Günlük kazanç geçmişi oluştur
      const history = Array.from(dailyEarnings.entries())
        .map(([date, data]) => ({
          period: date,
          deliveries: data.deliveries,
          earnings: data.earnings,
          averagePerDelivery: data.deliveries > 0 ? data.earnings / data.deliveries : 0
        }))
        .sort((a, b) => new Date(b.period).getTime() - new Date(a.period).getTime())
        .slice(0, 30); // Son 30 gün

      setEarningsHistory(history);

      // En çok kazanılan günler
      const topDays = [...history]
        .sort((a, b) => b.earnings - a.earnings)
        .slice(0, 10);

      setTopEarningDays(topDays);

    } catch (error) {
      console.error("Kazanç verileri yüklenemedi:", error);
      toast.error("Kazanç verileri yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  if (loading) {
    return <LoadingState text="Kazanç verileri yükleniyor..." />;
  }

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kazançlarım</h1>
        <p className="text-muted-foreground">
          Teslimat kazançlarınızı ve performans verilerinizi görüntüleyin.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="history">Geçmiş</TabsTrigger>
          <TabsTrigger value="analytics">Analitik</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Temel İstatistikler */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bugünkü Kazanç</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.todayEarnings)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Günlük hedefin %{Math.round((stats.todayEarnings / 500) * 100)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Haftalık Kazanç</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.weeklyEarnings)}
                </div>
                <p className="text-xs text-green-600 mt-1">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +12% geçen haftaya göre
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aylık Kazanç</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.monthlyEarnings)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(), "MMMM yyyy", { locale: tr })}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Teslimat Başına</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.averagePerDelivery)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Ortalama kazanç
                </p>
              </CardContent>
            </Card>
          </div>

          {/* En İyi Performans */}
          {stats.bestDay && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-yellow-600" />
                    En İyi Gününüz
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Tarih:</span>
                    <span className="text-sm">
                      {format(new Date(stats.bestDay.date), "dd MMMM yyyy", { locale: tr })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Kazanç:</span>
                    <span className="text-lg font-bold text-yellow-600">
                      {formatCurrency(stats.bestDay.earnings)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Teslimat:</span>
                    <span className="text-sm">{stats.bestDay.deliveries} adet</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Genel Özet</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Toplam Kazanç:</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(stats.totalEarnings)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Tamamlanan Teslimat:</span>
                    <span className="text-sm">{stats.completedDeliveries} adet</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Başlangıç Tarihi:</span>
                    <span className="text-sm">
                      {stats.completedDeliveries > 0 ? 
                        format(new Date(), "MMM yyyy", { locale: tr }) : 
                        "Henüz teslimat yok"
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Kazanç Geçmişi</h2>
            <div className="flex gap-2">
              <Select value={timePeriod} onValueChange={setTimePeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Son 7 gün</SelectItem>
                  <SelectItem value="month">Son 30 gün</SelectItem>
                  <SelectItem value="quarter">Son 90 gün</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Dışa Aktar
              </Button>
            </div>
          </div>

          {/* Günlük Kazanç Listesi */}
          <Card>
            <CardHeader>
              <CardTitle>Günlük Kazançlar</CardTitle>
            </CardHeader>
            <CardContent>
              {earningsHistory.length > 0 ? (
                <div className="space-y-4">
                  {earningsHistory.slice(0, 10).map((day, index) => (
                    <div
                      key={day.period}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {format(new Date(day.period), "dd MMMM yyyy", { locale: tr })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {day.deliveries} teslimat
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          {formatCurrency(day.earnings)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Ort. {formatCurrency(day.averagePerDelivery)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Henüz kazanç geçmişiniz bulunmuyor</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* En Çok Kazanılan Günler */}
            <Card>
              <CardHeader>
                <CardTitle>En Çok Kazanılan Günler</CardTitle>
              </CardHeader>
              <CardContent>
                {topEarningDays.length > 0 ? (
                  <div className="space-y-3">
                    {topEarningDays.slice(0, 5).map((day, index) => (
                      <div key={day.period} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={index === 0 ? "default" : "outline"}>
                            {index + 1}
                          </Badge>
                          <span className="text-sm">
                            {format(new Date(day.period), "dd MMM", { locale: tr })}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(day.earnings)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {day.deliveries} teslimat
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <PieChart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Analiz için yeterli veri yok</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performans Metrikleri */}
            <Card>
              <CardHeader>
                <CardTitle>Performans Metrikleri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Günlük Hedef (₺500)</span>
                    <span>{Math.round((stats.todayEarnings / 500) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min((stats.todayEarnings / 500) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Haftalık Hedef (₺3000)</span>
                    <span>{Math.round((stats.weeklyEarnings / 3000) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${Math.min((stats.weeklyEarnings / 3000) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Aylık Hedef (₺12000)</span>
                    <span>{Math.round((stats.monthlyEarnings / 12000) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${Math.min((stats.monthlyEarnings / 12000) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Öneriler */}
          <Card>
            <CardHeader>
              <CardTitle>Kazanç Artırma Önerileri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <h4 className="font-medium">Yoğun Saatleri Değerlendir</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Öğle (12-14) ve akşam (19-21) saatlerinde daha fazla sipariş alın.
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <h4 className="font-medium">Express Teslimatları Tercih Et</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Express siparişler daha yüksek komisyon oranına sahiptir.
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-4 w-4 text-orange-600" />
                    <h4 className="font-medium">Teslimat Sayısını Artır</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Günde ortalama 15+ teslimat yaparak hedeflerinizi aşın.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}