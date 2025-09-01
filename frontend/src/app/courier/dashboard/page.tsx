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
  Navigation,
  Wifi,
  WifiOff,
  Bell,
  X
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { orderService } from "@/lib/api/order.service";
import { toast } from "sonner";
import { useSocket } from "@/contexts/SocketContext";
import { OrderNotificationModal } from "@/components/courier/OrderNotificationModal";

export default function CourierDashboard() {
  const { user } = useAuth();
  const { isConnected } = useSocket();
  const [loading, setLoading] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationOrderData, setNotificationOrderData] = useState<any>(null);
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
  const [activeDeliveries, setActiveDeliveries] = useState<any[]>([]);

  useEffect(() => {
    // İstatistikleri yükle
    loadStats();
  }, []);

  // Socket bildirimleri için event listener
  useEffect(() => {
    const handleSocketNotification = (event: CustomEvent) => {
      const data = event.detail;
      console.log('Dashboard - Socket bildirimi alındı:', data);
      
      // Yeni sipariş bildirimi geldiğinde modal'ı göster
      if (data.type === 'NEW_ORDER' && data.data) {
        setNotificationOrderData(data.data);
        setShowNotificationModal(true);
        
        // Bildirim sesi çal (socket service'de zaten çalıyor)
      }
      
      // Sipariş başka kurye tarafından alındıysa modal'ı kapat
      if (data.type === 'ORDER_ACCEPTED_BY_ANOTHER') {
        // Eğer aynı sipariş için modal açıksa kapat
        if (notificationOrderData?.id === data.data?.orderId) {
          setShowNotificationModal(false);
          setNotificationOrderData(null);
          toast.info('Sipariş başka bir kurye tarafından kabul edildi');
        }
      }
      
      // Sipariş ile ilgili bildirimler geldiğinde istatistikleri yeniden yükle
      if (data.type === 'ORDER_ASSIGNED' || data.type === 'ORDER_STATUS_UPDATE') {
        setTimeout(() => {
          loadStats(); // İstatistikleri güncelle
        }, 1000);
      }
    };

    const handleSocketToast = (event: CustomEvent) => {
      const { title, message, data } = event.detail;
      
      // Yeni sipariş bildirimi modal ile gösterildiği için toast gösterme
      if (data?.type === 'NEW_ORDER') {
        return; // Modal gösterilecek, toast'a gerek yok
      } else {
        // Diğer bildirimler için normal toast
        toast(title, {
          description: message,
          duration: 5000,
        });
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('socket-notification', handleSocketNotification as EventListener);
      window.addEventListener('socket-toast', handleSocketToast as EventListener);

      return () => {
        window.removeEventListener('socket-notification', handleSocketNotification as EventListener);
        window.removeEventListener('socket-toast', handleSocketToast as EventListener);
      };
    }
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [statsData, ordersData] = await Promise.all([
        orderService.getCourierStatistics(),
        orderService.getCourierOrders()
      ]);
      
      // Backend'den gelen veriyi uygun formata dönüştür
      setStats({
        todayDeliveries: statsData.todayDeliveries || 0,
        completedDeliveries: statsData.todayDeliveries || 0,
        pendingDeliveries: statsData.activeOrders || 0,
        totalDistance: 0, // Backend'de henüz mesafe takibi yok
        todayEarnings: statsData.todayEarnings || 0,
        weeklyEarnings: 0, // Backend'de henüz haftalık veri yok
        monthlyEarnings: statsData.totalEarnings || 0,
        rating: statsData.averageRating || 0,
        totalDeliveries: statsData.totalDeliveries || 0,
      });

      // Aktif siparişleri filtrele ve formatlı hale getir
      const activeOrders = ordersData?.filter(
        (order: any) => order.status === 'ACCEPTED' || order.status === 'IN_PROGRESS'
      ).map((order: any) => ({
        id: order.orderNumber,
        pickup: order.pickupAddress?.address || 'Alınma adresi',
        delivery: order.deliveryAddress?.address || 'Teslimat adresi',
        distance: order.distance ? `${order.distance} km` : 'Hesaplanıyor',
        time: order.estimatedTime ? `${order.estimatedTime} dk` : 'Hesaplanıyor',
        price: `₺${order.courierEarning || order.price}`,
        status: order.status === 'ACCEPTED' ? 'pickup' : 'delivery',
      })) || [];

      setActiveDeliveries(activeOrders);
    } catch (error) {
      console.error("İstatistikler yüklenemedi:", error);
      toast.error("İstatistikler yüklenirken hata oluştu");
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

  if (loading) {
    return <LoadingState text="Dashboard yükleniyor..." />;
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-0">
      {/* Başlık */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
            Hoş Geldiniz, {user?.courier?.fullName || 'Kurye'}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {format(new Date(), "dd MMMM yyyy, EEEE", { locale: tr })}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <Badge variant="outline" className="py-1 px-2 sm:py-2 sm:px-4 text-xs sm:text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1 sm:mr-2 animate-pulse" />
            <span className="hidden sm:inline">Aktif</span>
            <span className="sm:hidden">A</span>
          </Badge>
          <Badge 
            variant={isConnected ? "secondary" : "destructive"} 
            className="py-1 px-2 sm:py-2 sm:px-4 text-xs sm:text-sm"
          >
            {isConnected ? (
              <Wifi className="mr-1 sm:mr-2 h-3 w-3" />
            ) : (
              <WifiOff className="mr-1 sm:mr-2 h-3 w-3" />
            )}
            <span className="hidden sm:inline">{isConnected ? "Bağlı" : "Bağlantı Yok"}</span>
            <span className="sm:hidden">{isConnected ? "B" : "X"}</span>
          </Badge>
          <Button size="sm" className="sm:size-default">
            <MapPin className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Haritayı Aç</span>
          </Button>
        </div>
      </div>

      {/* Önemli Bilgiler */}
      {stats.pendingDeliveries > 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 sm:pt-6 gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
              <p className="text-xs sm:text-sm">
                <span className="font-medium">{stats.pendingDeliveries} adet</span> bekleyen teslimatınız var.
              </p>
            </div>
            <Button size="sm" variant="outline" className="w-full sm:w-auto">
              Teslimatları Gör
            </Button>
          </CardContent>
        </Card>
      )}

      {/* İstatistikler */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-1 sm:p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="text-lg sm:text-2xl font-bold">{stat.value}</div>
              {stat.subtitle && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {stat.subtitle}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Günlük Performans */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Günlük Performans</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium">Teslimat Hedefi</span>
              <span className="text-xs sm:text-sm text-muted-foreground">
                {stats.completedDeliveries} / 10
              </span>
            </div>
            <Progress value={(stats.completedDeliveries / 10) * 100} className="h-2" />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium">Mesafe Hedefi</span>
              <span className="text-xs sm:text-sm text-muted-foreground">
                {stats.totalDistance} / 60 km
              </span>
            </div>
            <Progress value={(stats.totalDistance / 60) * 100} className="h-2" />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium">Kazanç Hedefi</span>
              <span className="text-xs sm:text-sm text-muted-foreground">
                ₺{stats.todayEarnings} / ₺500
              </span>
            </div>
            <Progress value={(stats.todayEarnings / 500) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Kazançlar */}
      <div>
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Kazançlarım</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
          {earningsCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-1 sm:p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <div className="text-lg sm:text-2xl font-bold">{stat.value}</div>
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
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Aktif Teslimatlar</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          {activeDeliveries.length > 0 ? (
            <>
              <div className="space-y-3 sm:space-y-4">
                {activeDeliveries.map((delivery) => (
                  <div key={delivery.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg gap-3">
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                      <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                        delivery.status === 'pickup' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        {delivery.status === 'pickup' ? (
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                        ) : (
                          <Navigation className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base">{delivery.id}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {delivery.pickup} → {delivery.delivery}
                        </p>
                        <div className="flex items-center gap-3 sm:gap-4 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {delivery.distance}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {delivery.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:block sm:text-right mt-2 sm:mt-0">
                      <p className="font-medium text-sm sm:text-base">{delivery.price}</p>
                      <Badge 
                        variant={delivery.status === 'pickup' ? 'default' : 'secondary'}
                        className="text-xs sm:text-sm sm:mt-1"
                      >
                        {delivery.status === 'pickup' ? 'Alınacak' : 'Teslimatta'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full mt-3 sm:mt-4 text-xs sm:text-sm">
                Tüm Teslimatları Görüntüle
              </Button>
            </>
          ) : (
            <div className="text-center py-6 sm:py-8 text-muted-foreground">
              <Package className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 opacity-50" />
              <p className="text-sm sm:text-base">Aktif teslimatınız bulunmamaktadır</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sipariş Bildirim Modal'ı */}
      <OrderNotificationModal
        isOpen={showNotificationModal}
        onClose={() => {
          setShowNotificationModal(false);
          setNotificationOrderData(null);
        }}
        orderData={notificationOrderData}
        onAccept={() => {
          // Modal içinde accept işlemi yapılıyor
          loadStats(); // İstatistikleri güncelle
        }}
        onReject={() => {
          // Sipariş reddedildi
          toast.info('Sipariş reddedildi');
        }}
      />
    </div>
  );
}