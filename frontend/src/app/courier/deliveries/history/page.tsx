"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/shared/LoadingState";
import { 
  Package, 
  MapPin,
  Clock,
  DollarSign,
  Phone,
  Navigation,
  Building,
  Timer,
  CheckCircle,
  XCircle,
  Star,
  Calendar,
  Search,
  Filter,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { orderService } from "@/lib/api/order.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DeliveryHistory() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [historyOrders, setHistoryOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    completedDeliveries: 0,
    cancelledDeliveries: 0,
    totalEarnings: 0,
    averageRating: 0
  });

  useEffect(() => {
    loadDeliveryHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [historyOrders, searchTerm, statusFilter, dateFilter]);

  const loadDeliveryHistory = async () => {
    try {
      setLoading(true);
      const response = await orderService.getCourierOrders({
        status: undefined // Tüm durumları getir
      });
      
      // Tamamlanmış ve iptal edilmiş siparişleri filtrele
      const completedStatuses = ['DELIVERED', 'CANCELLED'];
      const filtered = Array.isArray(response) ? 
        response.filter(order => completedStatuses.includes(order.status)) :
        [];
      
      // Tarihe göre sırala (en yeni önce)
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setHistoryOrders(filtered);
      
      // İstatistikleri hesapla
      const completed = filtered.filter(o => o.status === 'DELIVERED');
      const cancelled = filtered.filter(o => o.status === 'CANCELLED');
      const totalEarnings = completed.reduce((sum, order) => sum + (order.courierEarning || order.price), 0);
      const ratingsCount = completed.filter(o => o.rating).length;
      const avgRating = ratingsCount > 0 ? 
        completed.reduce((sum, order) => sum + (order.rating || 0), 0) / ratingsCount : 0;
      
      setStats({
        totalDeliveries: filtered.length,
        completedDeliveries: completed.length,
        cancelledDeliveries: cancelled.length,
        totalEarnings,
        averageRating: avgRating
      });
      
    } catch (error) {
      console.error("Teslimat geçmişi yüklenemedi:", error);
      toast.error("Teslimat geçmişi yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...historyOrders];

    // Durum filtresi
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Tarih filtresi
    if (dateFilter !== "ALL") {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case "TODAY":
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(order => new Date(order.deliveredAt || order.cancelledAt) >= filterDate);
          break;
        case "WEEK":
          filterDate.setDate(filterDate.getDate() - 7);
          filtered = filtered.filter(order => new Date(order.deliveredAt || order.cancelledAt) >= filterDate);
          break;
        case "MONTH":
          filterDate.setMonth(filterDate.getMonth() - 1);
          filtered = filtered.filter(order => new Date(order.deliveredAt || order.cancelledAt) >= filterDate);
          break;
      }
    }

    // Arama filtresi
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(term) ||
        order.recipientName.toLowerCase().includes(term) ||
        order.company?.name?.toLowerCase().includes(term) ||
        order.pickupAddress?.address?.toLowerCase().includes(term) ||
        order.deliveryAddress?.address?.toLowerCase().includes(term)
      );
    }

    setFilteredOrders(filtered);
  };

  const getStatusLabel = (status: string) => {
    const labels: any = {
      DELIVERED: "Teslim Edildi",
      CANCELLED: "İptal Edildi",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      DELIVERED: "default",
      CANCELLED: "destructive",
    };
    return colors[status] || "secondary";
  };

  const getPackageTypeLabel = (type: string) => {
    const labels: any = {
      DOCUMENT: "Evrak",
      PACKAGE: "Paket",
      FOOD: "Yemek",
      OTHER: "Diğer",
    };
    return labels[type] || type;
  };

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5 md:gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-2.5 w-2.5 md:h-3 md:w-3 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">({rating})</span>
      </div>
    );
  };

  if (loading) {
    return <LoadingState text="Teslimat geçmişi yükleniyor..." />;
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Başlık */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Teslimat Geçmişi</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Tamamlanan ve iptal edilen teslimatlarınızı görüntüleyin.
        </p>
      </div>

      {/* İstatistikler - Mobilde 2x2 grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Toplam Teslimat</CardTitle>
            <Package className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <div className="text-xl md:text-2xl font-bold">{stats.totalDeliveries}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedDeliveries} başarılı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Başarı Oranı</CardTitle>
            <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <div className="text-xl md:text-2xl font-bold">
              {stats.totalDeliveries > 0 ? 
                Math.round((stats.completedDeliveries / stats.totalDeliveries) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.cancelledDeliveries} iptal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Toplam Kazanç</CardTitle>
            <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <div className="text-xl md:text-2xl font-bold">₺{stats.totalEarnings.toLocaleString('tr-TR')}</div>
            <p className="text-xs text-muted-foreground">
              Ort. ₺{stats.completedDeliveries > 0 ? Math.round(stats.totalEarnings / stats.completedDeliveries) : 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Ortalama Puan</CardTitle>
            <Star className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <div className="text-xl md:text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <div className="mt-1">
              {renderRating(Math.round(stats.averageRating))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtreler */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-lg">Filtreler</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
          <div className="grid gap-3 md:gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-xs md:text-sm font-medium">Arama</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Sipariş no, alıcı adı..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9 md:h-10 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs md:text-sm font-medium">Durum</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 md:h-10 text-sm">
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tümü</SelectItem>
                  <SelectItem value="DELIVERED">Teslim Edildi</SelectItem>
                  <SelectItem value="CANCELLED">İptal Edildi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs md:text-sm font-medium">Tarih</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="h-9 md:h-10 text-sm">
                  <SelectValue placeholder="Tarih seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tümü</SelectItem>
                  <SelectItem value="TODAY">Bugün</SelectItem>
                  <SelectItem value="WEEK">Son 7 gün</SelectItem>
                  <SelectItem value="MONTH">Son 30 gün</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs md:text-sm font-medium hidden md:block">İşlemler</label>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("ALL");
                  setDateFilter("ALL");
                }}
                className="w-full h-9 md:h-10 text-sm md:mt-7"
                size="sm"
              >
                <Filter className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                Filtreleri Temizle
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teslimat Listesi */}
      {filteredOrders.length > 0 ? (
        <div className="grid gap-3 md:gap-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="p-4 md:p-6 pb-3 md:pb-3">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="space-y-2 md:space-y-1 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <CardTitle className="text-base md:text-lg">
                        Sipariş #{order.orderNumber}
                      </CardTitle>
                      <Badge variant={getStatusColor(order.status)} className="w-fit text-xs">
                        {order.status === 'DELIVERED' ? (
                          <CheckCircle className="mr-1 h-2.5 w-2.5 md:h-3 md:w-3" />
                        ) : (
                          <XCircle className="mr-1 h-2.5 w-2.5 md:h-3 md:w-3" />
                        )}
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        <span className="truncate max-w-[150px] sm:max-w-none">{order.company?.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {format(
                            new Date(order.deliveredAt || order.cancelledAt || order.createdAt),
                            "dd MMM yyyy HH:mm",
                            { locale: tr }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <div className="text-xl md:text-2xl font-bold text-green-600">
                      ₺{order.courierEarning || order.price}
                    </div>
                    <div className="text-xs text-muted-foreground">Kazanç</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0 md:pt-0 space-y-3 md:space-y-4">
                {/* Paket Bilgileri */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Package className="mr-1 h-2.5 w-2.5 md:h-3 md:w-3" />
                    {getPackageTypeLabel(order.packageType)}
                  </Badge>
                  {order.deliveryType === 'EXPRESS' && (
                    <Badge variant="secondary" className="text-xs">
                      <Timer className="mr-1 h-2.5 w-2.5 md:h-3 md:w-3" />
                      Express
                    </Badge>
                  )}
                </div>

                {/* Adresler (Özet) */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-xs md:text-sm">
                    <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="font-medium flex-shrink-0">Alım:</span>
                    <span className="text-muted-foreground truncate flex-1">
                      {order.pickupAddress?.address || "Adres bilgisi yok"}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-xs md:text-sm">
                    <Navigation className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="font-medium flex-shrink-0">Teslimat:</span>
                    <span className="text-muted-foreground truncate flex-1">
                      {order.deliveryAddress?.address || "Adres bilgisi yok"}
                    </span>
                  </div>
                </div>

                {/* Alıcı ve Puan */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="text-xs md:text-sm">
                      <span className="font-medium">Alıcı:</span> {order.recipientName}
                    </p>
                  </div>
                  {order.status === 'DELIVERED' && (
                    <div className="sm:text-right">
                      {order.rating ? (
                        renderRating(order.rating)
                      ) : (
                        <span className="text-xs text-muted-foreground">Değerlendirilmedi</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Geri bildirim */}
                {order.feedback && (
                  <div className="rounded-lg bg-blue-50 p-2.5 md:p-3 dark:bg-blue-900/20">
                    <p className="text-xs md:text-sm">
                      <span className="font-medium">Geri bildirim:</span> {order.feedback}
                    </p>
                  </div>
                )}

                {/* İptal nedeni */}
                {order.status === 'CANCELLED' && order.cancellationReason && (
                  <div className="rounded-lg bg-red-50 p-2.5 md:p-3 dark:bg-red-900/20">
                    <p className="text-xs md:text-sm">
                      <span className="font-medium">İptal nedeni:</span> {order.cancellationReason}
                    </p>
                  </div>
                )}

                {/* Detay Butonu */}
                <div className="flex justify-end sm:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/courier/orders/${order.id}`)}
                    className="w-full sm:w-auto text-xs md:text-sm h-8 md:h-9"
                  >
                    <Eye className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                    Detayları Gör
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 md:py-12 px-4">
            <Package className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground/50 mb-3 md:mb-4" />
            <h3 className="text-base md:text-lg font-medium mb-1 text-center">
              {historyOrders.length === 0 ? "Henüz teslimat geçmişiniz yok" : "Filtrelere uygun teslimat bulunamadı"}
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground text-center max-w-sm">
              {historyOrders.length === 0 ? 
                "İlk teslimatınızı tamamladığınızda burada görünecektir." :
                "Farklı filtreler deneyerek daha fazla sonuç bulabilirsiniz."
              }
            </p>
            {historyOrders.length === 0 && (
              <Button 
                variant="outline" 
                onClick={() => router.push('/courier/available-orders')}
                className="mt-4 text-xs md:text-sm h-8 md:h-10"
                size="sm"
              >
                <Package className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                Yeni Siparişler
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}