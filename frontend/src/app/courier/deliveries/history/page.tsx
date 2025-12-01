"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/shared/LoadingState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package,
  CheckCircle,
  XCircle,
  Star,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Wallet,
  Banknote,
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

const statusColors: Record<string, string> = {
  DELIVERED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-700 border border-rose-200",
};

const statusLabels: Record<string, string> = {
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal",
};

// Kapıda ödeme tutarını al (Yemeksepeti siparişlerinde collectFromCustomer)
const getCashOnDelivery = (order: any): number | null => {
  const payload = order.yemeksepetiOrder?.payload;
  if (payload?.price?.collectFromCustomer) {
    const amount = parseFloat(payload.price.collectFromCustomer);
    if (amount > 0) return amount;
  }
  return null;
};

export default function DeliveryHistory() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [historyOrders, setHistoryOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

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

  const loadDeliveryHistory = async () => {
    try {
      setLoading(true);
      const response = await orderService.getCourierOrders({
        status: undefined
      });

      const completedStatuses = ['DELIVERED', 'CANCELLED'];
      const filtered = Array.isArray(response) ?
        response.filter(order => completedStatuses.includes(order.status)) :
        [];

      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setHistoryOrders(filtered);

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

  // Filtreleme
  const filteredOrders = useMemo(() => {
    let filtered = [...historyOrders];

    if (statusFilter !== "ALL") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (dateFilter !== "ALL") {
      const filterDate = new Date();

      switch (dateFilter) {
        case "TODAY":
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(order => new Date(order.deliveredAt || order.cancelledAt || order.createdAt) >= filterDate);
          break;
        case "WEEK":
          filterDate.setDate(filterDate.getDate() - 7);
          filtered = filtered.filter(order => new Date(order.deliveredAt || order.cancelledAt || order.createdAt) >= filterDate);
          break;
        case "MONTH":
          filterDate.setMonth(filterDate.getMonth() - 1);
          filtered = filtered.filter(order => new Date(order.deliveredAt || order.cancelledAt || order.createdAt) >= filterDate);
          break;
      }
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderNumber?.toLowerCase().includes(term) ||
        order.recipientName?.toLowerCase().includes(term) ||
        order.company?.name?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [historyOrders, searchTerm, statusFilter, dateFilter]);

  // Sayfalama
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize);

  // Filtrelerde değişiklik olunca sayfa sıfırla
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter]);

  const renderRating = (rating: number | null) => {
    if (!rating) return <span className="text-xs text-slate-400">-</span>;
    return (
      <div className="flex items-center gap-1">
        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        <span className="text-sm text-slate-700">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (loading) {
    return <LoadingState text="Teslimat geçmişi yükleniyor..." />;
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5">
      {/* Başlık */}
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-slate-800">Teslimat Geçmişi</h1>
        <p className="text-sm text-slate-500 mt-0.5">Tamamlanan ve iptal edilen teslimatlarınız</p>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3 md:p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm text-slate-500">Toplam</span>
            <Package className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-xl md:text-2xl font-semibold text-slate-800 mt-1">{stats.totalDeliveries}</p>
          <p className="text-xs text-slate-400">{stats.completedDeliveries} başarılı</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3 md:p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm text-slate-500">Başarı</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-xl md:text-2xl font-semibold text-slate-800 mt-1">
            {stats.totalDeliveries > 0 ? Math.round((stats.completedDeliveries / stats.totalDeliveries) * 100) : 0}%
          </p>
          <p className="text-xs text-slate-400">{stats.cancelledDeliveries} iptal</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3 md:p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm text-slate-500">Kazanç</span>
            <Wallet className="h-4 w-4 text-sky-500" />
          </div>
          <p className="text-xl md:text-2xl font-semibold text-slate-800 mt-1">₺{stats.totalEarnings.toLocaleString('tr-TR')}</p>
          <p className="text-xs text-slate-400">
            Ort. ₺{stats.completedDeliveries > 0 ? Math.round(stats.totalEarnings / stats.completedDeliveries) : 0}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3 md:p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm text-slate-500">Puan</span>
            <Star className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-xl md:text-2xl font-semibold text-slate-800 mt-1">{stats.averageRating.toFixed(1)}</p>
          <div className="flex gap-0.5 mt-0.5">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className={`h-3 w-3 ${i <= Math.round(stats.averageRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Filtreler */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Sipariş no veya alıcı ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white border-slate-200 text-sm h-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[140px] bg-white border-slate-200 text-sm h-9">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tüm Durumlar</SelectItem>
            <SelectItem value="DELIVERED">Teslim Edildi</SelectItem>
            <SelectItem value="CANCELLED">İptal Edildi</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-full sm:w-[130px] bg-white border-slate-200 text-sm h-9">
            <SelectValue placeholder="Tarih" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tüm Zamanlar</SelectItem>
            <SelectItem value="TODAY">Bugün</SelectItem>
            <SelectItem value="WEEK">Son 7 gün</SelectItem>
            <SelectItem value="MONTH">Son 30 gün</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tablo */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-10 w-10 text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-600">
              {historyOrders.length === 0 ? "Henüz teslimat geçmişiniz yok" : "Filtrelere uygun teslimat bulunamadı"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {historyOrders.length === 0 ? "İlk teslimatınızı tamamladığınızda burada görünecek" : "Farklı filtreler deneyin"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            {/* Desktop Tablo */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b">
                    <TableHead className="font-medium text-slate-600 w-[90px]">Sipariş</TableHead>
                    <TableHead className="font-medium text-slate-600">Firma</TableHead>
                    <TableHead className="font-medium text-slate-600">Alıcı</TableHead>
                    <TableHead className="font-medium text-slate-600 text-right w-[90px]">Kazanç</TableHead>
                    <TableHead className="font-medium text-slate-600 w-[100px]">Durum</TableHead>
                    <TableHead className="font-medium text-slate-600 w-[70px]">Puan</TableHead>
                    <TableHead className="font-medium text-slate-600 w-[100px]">Tarih</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                      onClick={() => router.push(`/courier/orders/${order.id}`)}
                    >
                      <TableCell className="py-3">
                        <span className="font-mono text-sm text-slate-700">
                          {order.orderNumber?.slice(-6)}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        <p className="text-sm text-slate-700 truncate max-w-[150px]">
                          {order.company?.name || "-"}
                        </p>
                      </TableCell>
                      <TableCell className="py-3">
                        <p className="text-sm text-slate-800">{order.recipientName}</p>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <div>
                          <span className={`font-semibold ${order.status === 'DELIVERED' ? 'text-emerald-600' : 'text-slate-400'}`}>
                            ₺{(order.courierEarning || order.price || 0).toFixed(0)}
                          </span>
                          {getCashOnDelivery(order) && (
                            <div className="flex items-center justify-end gap-1 mt-0.5">
                              <Banknote className="w-3 h-3 text-amber-500" />
                              <span className="text-xs text-amber-600">₺{getCashOnDelivery(order)?.toFixed(0)}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge variant="secondary" className={`${statusColors[order.status]} text-xs font-medium`}>
                          {order.status === 'DELIVERED' ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          {statusLabels[order.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        {renderRating(order.rating)}
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="text-right">
                          <p className="text-sm text-slate-700">
                            {format(new Date(order.deliveredAt || order.cancelledAt || order.createdAt), 'HH:mm', { locale: tr })}
                          </p>
                          <p className="text-xs text-slate-400">
                            {format(new Date(order.deliveredAt || order.cancelledAt || order.createdAt), 'dd MMM', { locale: tr })}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-3" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/courier/orders/${order.id}`)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Liste */}
            <div className="md:hidden divide-y divide-slate-100">
              {paginatedOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 hover:bg-slate-50/80 active:bg-slate-100 transition-colors cursor-pointer"
                  onClick={() => router.push(`/courier/orders/${order.id}`)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm text-slate-700">#{order.orderNumber?.slice(-6)}</span>
                        <Badge variant="secondary" className={`${statusColors[order.status]} text-[10px] font-medium px-1.5 py-0`}>
                          {order.status === 'DELIVERED' ? 'Teslim' : 'İptal'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-800 truncate">{order.recipientName}</p>
                      <p className="text-xs text-slate-500 truncate">{order.company?.name}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-semibold ${order.status === 'DELIVERED' ? 'text-emerald-600' : 'text-slate-400'}`}>
                        ₺{(order.courierEarning || order.price || 0).toFixed(0)}
                      </p>
                      {getCashOnDelivery(order) && (
                        <div className="flex items-center justify-end gap-1 mt-0.5">
                          <Banknote className="w-3 h-3 text-amber-500" />
                          <span className="text-xs text-amber-600">₺{getCashOnDelivery(order)?.toFixed(0)}</span>
                        </div>
                      )}
                      <p className="text-xs text-slate-400 mt-0.5">
                        {format(new Date(order.deliveredAt || order.cancelledAt || order.createdAt), 'dd MMM HH:mm', { locale: tr })}
                      </p>
                      {order.rating && (
                        <div className="flex items-center justify-end gap-0.5 mt-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs text-slate-600">{order.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sayfalama */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  {filteredOrders.length} teslimat
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-slate-600">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
