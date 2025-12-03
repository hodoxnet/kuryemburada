'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  MessageSquare,
  Clock,
  MapPin,
  Phone,
  User,
  CheckCircle,
  XCircle,
  RefreshCw,
  FileText,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import whatsappAPI, { PendingOrder, ApproveOrderData } from '@/lib/api/whatsapp';

export default function WhatsAppOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;

  // Approval modal state
  const [approvalModal, setApprovalModal] = useState<{
    open: boolean;
    order: PendingOrder | null;
    type: 'approve' | 'reject';
  }>({
    open: false,
    order: null,
    type: 'approve',
  });

  const [approvalData, setApprovalData] = useState<ApproveOrderData>({
    price: 0,
    estimatedDeliveryTime: 30,
    notes: '',
  });

  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await whatsappAPI.getPendingOrders(page, limit);
      setOrders(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('Siparişler yüklenemedi:', error);
      toast.error('Siparişler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const handleOpenApprove = (order: PendingOrder) => {
    setApprovalData({ price: 0, estimatedDeliveryTime: 30, notes: '' });
    setApprovalModal({ open: true, order, type: 'approve' });
  };

  const handleOpenReject = (order: PendingOrder) => {
    setRejectReason('');
    setApprovalModal({ open: true, order, type: 'reject' });
  };

  const handleApprove = async () => {
    if (!approvalModal.order) return;

    if (approvalData.price <= 0) {
      toast.error('Lütfen geçerli bir fiyat girin');
      return;
    }

    setSubmitting(true);

    try {
      await whatsappAPI.approveOrder(approvalModal.order.id, approvalData);
      toast.success('Sipariş onaylandı! Müşteriye fiyat bildirimi gönderildi.');
      setApprovalModal({ open: false, order: null, type: 'approve' });
      fetchOrders();
    } catch (error: any) {
      console.error('Onay hatası:', error);
      toast.error(error.response?.data?.message || 'Sipariş onaylanamadı');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!approvalModal.order) return;

    setSubmitting(true);

    try {
      await whatsappAPI.rejectOrder(approvalModal.order.id, { reason: rejectReason || undefined });
      toast.success('Sipariş reddedildi');
      setApprovalModal({ open: false, order: null, type: 'reject' });
      fetchOrders();
    } catch (error: any) {
      console.error('Red hatası:', error);
      toast.error(error.response?.data?.message || 'Sipariş reddedilemedi');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAddressText = (address: any) => {
    if (!address) return '-';
    if (typeof address === 'string') return address;
    return address.address || address.detail || JSON.stringify(address);
  };

  if (loading && orders.length === 0) {
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-green-600" />
            WhatsApp Siparişleri
          </h1>
          <p className="text-muted-foreground">
            WhatsApp üzerinden gelen siparişleri onaylayın veya reddedin
          </p>
        </div>
        <Button variant="outline" onClick={fetchOrders} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Yenile
        </Button>
      </div>

      {/* Bilgi Kartı */}
      <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="text-sm text-green-800 dark:text-green-400">
              <p className="font-medium">Onay Bekleyen Siparişler</p>
              <p className="text-green-700 dark:text-green-500">
                Bu sayfada WhatsApp üzerinden gelen ve fiyat onayı bekleyen siparişler listelenir.
                Siparişi onayladığınızda müşteriye fiyat bildirimi gönderilir.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Siparişler Tablosu */}
      <Card>
        <CardHeader>
          <CardTitle>Onay Bekleyen Siparişler ({total})</CardTitle>
          <CardDescription>
            Fiyat belirleyerek onaylayın veya reddedin
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">Onay Bekleyen Sipariş Yok</h3>
              <p className="text-muted-foreground">
                Yeni siparişler geldiğinde burada görünecek
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sipariş No</TableHead>
                  <TableHead>Müşteri</TableHead>
                  <TableHead>Sipariş İçeriği</TableHead>
                  <TableHead>Adres</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <User className="h-3 w-3" />
                          {order.customerName || '-'}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {order.customerPhone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm line-clamp-2">{order.orderContent}</p>
                        {order.notes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Not: {order.notes}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-1 text-sm max-w-xs">
                        <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">
                          {getAddressText(order.deliveryAddress)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(order.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleOpenReject(order)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reddet
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleOpenApprove(order)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Onayla
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {total > limit && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Toplam {total} sipariş
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Önceki
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page * limit >= total}
                  onClick={() => setPage(page + 1)}
                >
                  Sonraki
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval/Reject Modal */}
      <Dialog
        open={approvalModal.open}
        onOpenChange={(open) => !open && setApprovalModal({ open: false, order: null, type: 'approve' })}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {approvalModal.type === 'approve' ? (
                <span className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Siparişi Onayla
                </span>
              ) : (
                <span className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  Siparişi Reddet
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              {approvalModal.order && (
                <span>Sipariş No: {approvalModal.order.orderNumber}</span>
              )}
            </DialogDescription>
          </DialogHeader>

          {approvalModal.order && (
            <div className="space-y-4">
              {/* Sipariş Özeti */}
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-start gap-2 mb-2">
                  <FileText className="h-4 w-4 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Sipariş İçeriği</p>
                    <p className="text-sm text-muted-foreground">
                      {approvalModal.order.orderContent}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Müşteri</p>
                    <p className="text-sm text-muted-foreground">
                      {approvalModal.order.customerName} - {approvalModal.order.customerPhone}
                    </p>
                  </div>
                </div>
              </div>

              {approvalModal.type === 'approve' ? (
                <>
                  {/* Fiyat */}
                  <div className="grid gap-2">
                    <Label htmlFor="price">Fiyat (TL) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={approvalData.price || ''}
                      onChange={(e) =>
                        setApprovalData({ ...approvalData, price: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>

                  {/* Tahmini Teslimat Süresi */}
                  <div className="grid gap-2">
                    <Label htmlFor="deliveryTime">Tahmini Teslimat Süresi (dakika)</Label>
                    <Input
                      id="deliveryTime"
                      type="number"
                      min="1"
                      placeholder="30"
                      value={approvalData.estimatedDeliveryTime || ''}
                      onChange={(e) =>
                        setApprovalData({
                          ...approvalData,
                          estimatedDeliveryTime: parseInt(e.target.value) || undefined,
                        })
                      }
                    />
                  </div>

                  {/* Not */}
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Not (Opsiyonel)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Müşteriye iletilecek not..."
                      value={approvalData.notes || ''}
                      onChange={(e) =>
                        setApprovalData({ ...approvalData, notes: e.target.value })
                      }
                      rows={2}
                    />
                  </div>
                </>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="reason">Red Nedeni (Opsiyonel)</Label>
                  <Textarea
                    id="reason"
                    placeholder="Müşteriye iletilecek red nedeni..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApprovalModal({ open: false, order: null, type: 'approve' })}
              disabled={submitting}
            >
              İptal
            </Button>
            {approvalModal.type === 'approve' ? (
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleApprove}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Onaylanıyor...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Onayla ve Bildir
                  </>
                )}
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Reddediliyor...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reddet
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
