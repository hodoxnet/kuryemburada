"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/shared/LoadingState";
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  DollarSign,
  Bike,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";

export default function CompanyDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    todayOrders: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
    activeCouriers: 0,
  });

  useEffect(() => {
    // İstatistikleri yükle
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      // API çağrısı yapılacak
      // const data = await orderService.getCompanyStats();
      // setStats(data);
      
      // Şimdilik mock data
      setStats({
        totalOrders: 1234,
        pendingOrders: 12,
        completedOrders: 1180,
        cancelledOrders: 42,
        todayOrders: 28,
        weeklyRevenue: 15420,
        monthlyRevenue: 68900,
        activeCouriers: 8,
      });
    } catch (error) {
      console.error("İstatistikler yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "Toplam Sipariş",
      value: stats.totalOrders,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: "+12%",
    },
    {
      title: "Bekleyen",
      value: stats.pendingOrders,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Tamamlanan",
      value: stats.completedOrders,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: "+8%",
    },
    {
      title: "İptal Edilen",
      value: stats.cancelledOrders,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  const revenueCards = [
    {
      title: "Bugünkü Sipariş",
      value: stats.todayOrders,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Haftalık Gelir",
      value: `₺${stats.weeklyRevenue.toLocaleString('tr-TR')}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      change: "+15%",
    },
    {
      title: "Aylık Gelir",
      value: `₺${stats.monthlyRevenue.toLocaleString('tr-TR')}`,
      icon: DollarSign,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      change: "+22%",
    },
    {
      title: "Aktif Kurye",
      value: stats.activeCouriers,
      icon: Bike,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  if (loading) {
    return <LoadingState text="Dashboard yükleniyor..." />;
  }

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Hoş Geldiniz, {user?.company?.name || 'Firma'}
          </h1>
          <p className="text-muted-foreground">
            {format(new Date(), "dd MMMM yyyy, EEEE", { locale: tr })}
          </p>
        </div>
        <Button>
          <Package className="mr-2 h-4 w-4" />
          Yeni Sipariş
        </Button>
      </div>

      {/* Önemli Bilgiler */}
      {stats.pendingOrders > 10 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <p className="text-sm">
              <span className="font-medium">{stats.pendingOrders} adet</span> bekleyen siparişiniz var.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Sipariş İstatistikleri */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Sipariş Durumu</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {statsCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.change && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.change} geçen aya göre
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Gelir ve Performans */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Gelir ve Performans</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {revenueCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.change && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.change} geçen aya göre
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Son Siparişler */}
      <Card>
        <CardHeader>
          <CardTitle>Son Siparişler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">#ORD-2024-001234</p>
                  <p className="text-sm text-muted-foreground">Kadıköy → Ataşehir</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">₺125</p>
                <p className="text-sm text-green-600">Teslim Edildi</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Package className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium">#ORD-2024-001235</p>
                  <p className="text-sm text-muted-foreground">Beşiktaş → Şişli</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">₺85</p>
                <p className="text-sm text-yellow-600">Yolda</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Package className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium">#ORD-2024-001236</p>
                  <p className="text-sm text-muted-foreground">Üsküdar → Maltepe</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">₺145</p>
                <p className="text-sm text-orange-600">Hazırlanıyor</p>
              </div>
            </div>
          </div>

          <Button variant="outline" className="w-full mt-4">
            Tüm Siparişleri Görüntüle
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}