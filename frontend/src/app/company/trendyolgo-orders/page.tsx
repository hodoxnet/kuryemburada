'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { orderService, Order } from '@/lib/api/order.service';
import { OrderDetailSheet } from './components/OrderDetailSheet';
import { toast } from 'sonner';
import {
  ShoppingBag,
  Search,
  Eye,
  CheckCircle,
  Truck,
  Timer,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
  ACCEPTED: 'bg-sky-50 text-sky-700 border border-sky-200',
  IN_PROGRESS: 'bg-violet-50 text-violet-700 border border-violet-200',
  DELIVERED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  CANCELLED: 'bg-slate-50 text-slate-600 border border-slate-200',
  REJECTED: 'bg-rose-50 text-rose-700 border border-rose-200',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Bekliyor',
  ACCEPTED: 'Kabul Edildi',
  IN_PROGRESS: 'Yolda',
  DELIVERED: 'Teslim Edildi',
  CANCELLED: 'İptal Edildi',
  REJECTED: 'Reddedildi',
};

// Trendyol Go payload'ından sipariş tutarını al
const getOrderTotal = (order: Order): number => {
  const payload = order.trendyolGoOrder?.payload as any;
  if (payload?.grossAmount) {
    return parseFloat(payload.grossAmount);
  }
  if (payload?.totalPrice) {
    return parseFloat(payload.totalPrice);
  }
  return order.price || 0;
};

export default function TrendyolGoOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [total, setTotal] = useState(0);
  const [requestingCouriers, setRequestingCouriers] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const result = await orderService.getTrendyolGoOrders({ take: 200 });
      if (result && result.data) {
        setOrders(result.data);
        setTotal(result.total);
      } else {
        setOrders([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Trendyol Go siparişleri yüklenemedi:', error);
      toast.error('Siparişler yüklenirken bir hata oluştu');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrelenmiş siparişler
  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];

    let filtered = [...orders];

    // Durum filtresi
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Arama filtresi
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderNumber?.toLowerCase().includes(search) ||
        order.trendyolGoOrder?.orderNumber?.toLowerCase().includes(search) ||
        order.trendyolGoOrder?.packageId?.toLowerCase().includes(search) ||
        order.recipientName?.toLowerCase().includes(search) ||
        order.recipientPhone?.includes(searchTerm)
      );
    }

    // Tarihe göre sırala (en yeni önce)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return filtered;
  }, [orders, searchTerm, statusFilter]);

  // Sayfalama
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize);

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setSheetOpen(true);
  };

  const handleRequestCouriers = async (orderId: string) => {
    try {
      setRequestingCouriers(orderId);
      await orderService.requestCouriers(orderId);
      toast.success('Kuryelere bildirim gönderildi');
      // Siparişleri yenile
      await fetchOrders();
    } catch (error: any) {
      console.error('Kurye çağırma hatası:', error);
      const errorMessage = error?.response?.data?.message || 'Kurye çağırılamadı';
      toast.error(errorMessage);
    } finally {
      setRequestingCouriers(null);
    }
  };

  // İstatistikler
  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    inProgress: orders.filter(o => o.status === 'IN_PROGRESS' || o.status === 'ACCEPTED').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
  }), [orders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Trendyol Go siparişleri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      {/* Başlık */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Trendyol Go Siparişleri</h1>
          <p className="text-slate-500 text-sm mt-0.5">Entegrasyondan gelen siparişler</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOrders} className="text-slate-600">
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Yenile
        </Button>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Toplam</span>
            <ShoppingBag className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-2xl font-semibold text-slate-800 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Bekleyen</span>
            <Timer className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-semibold text-slate-800 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Yolda</span>
            <Truck className="h-4 w-4 text-sky-500" />
          </div>
          <p className="text-2xl font-semibold text-slate-800 mt-1">{stats.inProgress}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Teslim</span>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-semibold text-slate-800 mt-1">{stats.delivered}</p>
        </div>
      </div>

      {/* Filtreler */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Sipariş no, paket ID, müşteri adı veya telefon ara..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 bg-white border-slate-200 text-sm"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[160px] bg-white border-slate-200 text-sm">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tüm Durumlar</SelectItem>
            <SelectItem value="PENDING">Bekliyor</SelectItem>
            <SelectItem value="ACCEPTED">Kabul Edildi</SelectItem>
            <SelectItem value="IN_PROGRESS">Yolda</SelectItem>
            <SelectItem value="DELIVERED">Teslim Edildi</SelectItem>
            <SelectItem value="CANCELLED">İptal Edildi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Siparişler Tablosu */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Trendyol Go siparişi bulunamadı</p>
            <p className="text-sm text-muted-foreground">
              {searchTerm || statusFilter !== 'ALL'
                ? 'Filtrelere uygun sipariş bulunamadı'
                : 'Henüz Trendyol Go siparişiniz bulunmuyor'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b">
                  <TableHead className="w-[100px] font-medium text-slate-600">Sipariş</TableHead>
                  <TableHead className="font-medium text-slate-600">Müşteri</TableHead>
                  <TableHead className="hidden lg:table-cell font-medium text-slate-600">Adres</TableHead>
                  <TableHead className="text-right font-medium text-slate-600 w-[100px]">Tutar</TableHead>
                  <TableHead className="font-medium text-slate-600 w-[110px]">Durum</TableHead>
                  <TableHead className="hidden sm:table-cell font-medium text-slate-600 w-[90px]">Tarih</TableHead>
                  <TableHead className="text-right w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                    onClick={() => openOrderDetails(order)}
                  >
                    <TableCell className="py-3">
                      <span className="font-mono text-sm text-slate-700">
                        {order.trendyolGoOrder?.orderNumber?.slice(-6) || order.orderNumber?.slice(-6)}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{order.recipientName}</p>
                        <p className="text-xs text-slate-500">{order.recipientPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell py-3">
                      <p className="text-sm text-slate-600 truncate max-w-[220px]">
                        {(order.deliveryAddress as any)?.address || '-'}
                      </p>
                    </TableCell>
                    <TableCell className="text-right py-3">
                      <span className="font-semibold text-slate-800">
                        ₺{getOrderTotal(order).toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge variant="secondary" className={`${statusColors[order.status] || 'bg-slate-100'} text-xs font-medium`}>
                        {statusLabels[order.status] || order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell py-3">
                      <div className="text-right">
                        <p className="text-sm text-slate-700">
                          {format(new Date(order.createdAt), 'HH:mm', { locale: tr })}
                        </p>
                        <p className="text-xs text-slate-400">
                          {format(new Date(order.createdAt), 'dd MMM', { locale: tr })}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-3">
                      <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        {order.status === 'PENDING' && !order.courierId && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRequestCouriers(order.id)}
                            disabled={requestingCouriers === order.id}
                            className="h-8 px-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                          >
                            <Truck className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openOrderDetails(order)}
                          className="h-8 px-2 text-slate-500 hover:text-slate-700"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Sayfalama */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-sm text-muted-foreground">
                  {filteredOrders.length} siparişten {(currentPage - 1) * pageSize + 1}-
                  {Math.min(currentPage * pageSize, filteredOrders.length)} arası gösteriliyor
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sipariş Detay Sheet */}
      <OrderDetailSheet
        order={selectedOrder}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onRequestCouriers={handleRequestCouriers}
        isRequestingCouriers={requestingCouriers === selectedOrder?.id}
        onOrderUpdated={fetchOrders}
      />
    </div>
  );
}
