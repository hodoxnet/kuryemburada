"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/shared/LoadingState";
import { Progress } from "@/components/ui/progress";
import { 
  Package, 
  Clock, 
  CheckCircle, 
  MapPin,
  TrendingUp,
  DollarSign,
  Star,
  AlertCircle,
  Navigation
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";

export default function CourierDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    todayDeliveries: 0,
    completedDeliveries: 0,
    pendingDeliveries: 0,
    totalDistance: 0,
    todayEarnings: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0,
    rating: 0,
    totalDeliveries: 0,
  });

  useEffect(() => {
    // İstatistikleri yükle
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      // API çağrısı yapılacak
      // const data = await deliveryService.getCourierStats();
      // setStats(data);
      
      // Şimdilik mock data
      setStats({
        todayDeliveries: 8,
        completedDeliveries: 6,
        pendingDeliveries: 2,
        totalDistance: 42.5,
        todayEarnings: 420,
        weeklyEarnings: 2100,
        monthlyEarnings: 8500,
        rating: 4.8,
        totalDeliveries: 324,
      });
    } catch (error) {
      console.error("İstatistikler yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "Bugünkü Teslimat",
      value: stats.todayDeliveries,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      subtitle: `${stats.completedDeliveries} tamamlandı`,
    },
    {
      title: "Bekleyen",
      value: stats.pendingDeliveries,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Bugünkü Mesafe",
      value: `${stats.totalDistance} km`,
      icon: Navigation,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Puan",
      value: stats.rating.toFixed(1),
      icon: Star,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      subtitle: `${stats.totalDeliveries} teslimat`,
    },
  ];

  const earningsCards = [
    {
      title: "Bugünkü Kazanç",
      value: `₺${stats.todayEarnings}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: "+15%",
    },
    {
      title: "Haftalık Kazanç",
      value: `₺${stats.weeklyEarnings.toLocaleString('tr-TR')}`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      change: "+8%",
    },
    {
      title: "Aylık Kazanç",
      value: `₺${stats.monthlyEarnings.toLocaleString('tr-TR')}`,
      icon: DollarSign,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      change: "+12%",
    },
  ];

  const activeDeliveries = [
    {
      id: "ORD-001",
      pickup: "Kadıköy, Moda",
      delivery: "Üsküdar, Çengelköy",
      distance: "8.5 km",
      time: "25 dk",
      price: "₺65",
      status: "pickup",
    },
    {
      id: "ORD-002",
      pickup: "Beşiktaş, Levent",
      delivery: "Şişli, Mecidiyeköy",
      distance: "4.2 km",
      time: "15 dk",
      price: "₺45",
      status: "delivery",
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
            Hoş Geldiniz, {user?.courier?.fullName || 'Kurye'}
          </h1>
          <p className="text-muted-foreground">
            {format(new Date(), "dd MMMM yyyy, EEEE", { locale: tr })}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="py-2 px-4">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            Aktif
          </Badge>
          <Button>
            <MapPin className="mr-2 h-4 w-4" />
            Haritayı Aç
          </Button>
        </div>
      </div>

      {/* Önemli Bilgiler */}
      {stats.pendingDeliveries > 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="flex items-center justify-between pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <p className="text-sm">
                <span className="font-medium">{stats.pendingDeliveries} adet</span> bekleyen teslimatınız var.
              </p>
            </div>
            <Button size="sm" variant="outline">
              Teslimatları Gör
            </Button>
          </CardContent>
        </Card>
      )}

      {/* İstatistikler */}
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
              {stat.subtitle && (
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.subtitle}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Günlük Performans */}
      <Card>
        <CardHeader>
          <CardTitle>Günlük Performans</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Teslimat Hedefi</span>
              <span className="text-sm text-muted-foreground">
                {stats.completedDeliveries} / 10
              </span>
            </div>
            <Progress value={(stats.completedDeliveries / 10) * 100} />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Mesafe Hedefi</span>
              <span className="text-sm text-muted-foreground">
                {stats.totalDistance} / 60 km
              </span>
            </div>
            <Progress value={(stats.totalDistance / 60) * 100} />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Kazanç Hedefi</span>
              <span className="text-sm text-muted-foreground">
                ₺{stats.todayEarnings} / ₺500
              </span>
            </div>
            <Progress value={(stats.todayEarnings / 500) * 100} />
          </div>
        </CardContent>
      </Card>

      {/* Kazançlar */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Kazançlarım</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {earningsCards.map((stat) => (
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
                    {stat.change} geçen döneme göre
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Aktif Teslimatlar */}
      <Card>
        <CardHeader>
          <CardTitle>Aktif Teslimatlar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeDeliveries.map((delivery) => (
              <div key={delivery.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    delivery.status === 'pickup' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    {delivery.status === 'pickup' ? (
                      <MapPin className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Navigation className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{delivery.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {delivery.pickup} → {delivery.delivery}
                    </p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {delivery.distance}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {delivery.time}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{delivery.price}</p>
                  <Badge variant={delivery.status === 'pickup' ? 'default' : 'secondary'}>
                    {delivery.status === 'pickup' ? 'Alınacak' : 'Teslimatta'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <Button variant="outline" className="w-full mt-4">
            Tüm Teslimatları Görüntüle
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}