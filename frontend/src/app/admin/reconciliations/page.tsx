'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  FileText,
  Download,
  Eye,
  CreditCard,
  RefreshCw,
  AlertCircle,
  Building,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { tr } from 'date-fns/locale';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Reconciliation {
  id: string;
  companyId: string;
  company: {
    name: string;
    taxNumber: string;
  };
  date: string;
  totalOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalAmount: number;
  courierCost: number;
  platformCommission: number;
  netAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'PENDING' | 'APPROVED' | 'PARTIALLY_PAID' | 'PAID' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

interface Company {
  id: string;
  name: string;
  taxNumber: string;
  status: string;
}

interface Order {
  id: string;
  orderNumber: string;
  price: number;
  status: string;
  deliveryTime?: string;
  courier?: {
    fullName: string;
  };
}

interface Payment {
  id: string;
  amount: number;
  paymentMethod: string;
  transactionReference?: string;
  description?: string;
  processedAt: string;
}

const ReconciliationStatus = {
  PENDING: { label: 'Bekliyor', color: 'bg-yellow-100 text-yellow-800' },
  APPROVED: { label: 'Onaylandı', color: 'bg-green-100 text-green-800' },
  PARTIALLY_PAID: { label: 'Kısmi Ödendi', color: 'bg-blue-100 text-blue-800' },
  PAID: { label: 'Ödendi', color: 'bg-emerald-100 text-emerald-800' },
  REJECTED: { label: 'Reddedildi', color: 'bg-red-100 text-red-800' },
};

const PaymentMethod = {
  CASH: 'Nakit',
  CREDIT_CARD: 'Kredi Kartı',
  BANK_TRANSFER: 'Banka Transferi',
};

export default function ReconciliationsPage() {
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState('current-month');
  const [selectedReconciliation, setSelectedReconciliation] = useState<Reconciliation | null>(null);
  const [reconciliationDetails, setReconciliationDetails] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'BANK_TRANSFER',
    transactionReference: '',
    description: '',
  });
  const [approvalForm, setApprovalForm] = useState({
    notes: '',
  });
  const [totalData, setTotalData] = useState({
    totalReconciliations: 0,
    totalAmount: 0,
    totalPaid: 0,
    totalRemaining: 0,
  });
  const [pagination, setPagination] = useState({
    skip: 0,
    take: 10,
    total: 0,
  });

  useEffect(() => {
    fetchCompanies();
    fetchReconciliations();
  }, [selectedCompany, selectedStatus, dateRange, pagination.skip]);

  const fetchCompanies = async () => {
    try {
      const response = await apiClient.get('/companies', {
        params: { take: 100, status: 'ACTIVE' }
      });
      setCompanies(response.data.data);
    } catch (error: any) {
      toast.error('Firmalar yüklenirken hata oluştu');
    }
  };

  const fetchReconciliations = async () => {
    setLoading(true);
    try {
      let startDate, endDate;
      const now = new Date();
      
      switch (dateRange) {
        case 'current-month':
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
        case 'last-month':
          startDate = startOfMonth(subMonths(now, 1));
          endDate = endOfMonth(subMonths(now, 1));
          break;
        case 'last-3-months':
          startDate = startOfMonth(subMonths(now, 2));
          endDate = endOfMonth(now);
          break;
        default:
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
      }

      const params: any = {
        skip: pagination.skip,
        take: pagination.take,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
      };

      if (selectedCompany !== 'all') params.companyId = selectedCompany;
      if (selectedStatus !== 'all') params.status = selectedStatus;

      const response = await apiClient.get('/reconciliation', { params });
      
      setReconciliations(response.data.data);
      setPagination(prev => ({ ...prev, total: response.data.total }));
      
      // Özet hesaplamalar
      const totals = response.data.data.reduce((acc: any, rec: Reconciliation) => {
        acc.totalAmount += rec.netAmount;
        acc.totalPaid += rec.paidAmount;
        acc.totalRemaining += rec.remainingAmount;
        return acc;
      }, { totalAmount: 0, totalPaid: 0, totalRemaining: 0 });
      
      setTotalData({
        totalReconciliations: response.data.total,
        ...totals,
      });
    } catch (error: any) {
      toast.error('Mutabakatlar yüklenirken hata oluştu');
      console.error('Mutabakat yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReconciliationDetails = async (id: string) => {
    try {
      const [reconciliation, details] = await Promise.all([
        apiClient.get(`/reconciliation/${id}`),
        apiClient.get(`/company-payments/reconciliation/${id}`),
      ]);
      
      setSelectedReconciliation(reconciliation.data);
      setReconciliationDetails(details.data);
      setShowDetailsDialog(true);
    } catch (error: any) {
      toast.error('Mutabakat detayları yüklenirken hata oluştu');
    }
  };

  const handleGenerateDailyReconciliations = async () => {
    if (!confirm('Tüm aktif firmalar için günlük mutabakatlar oluşturulacak. Devam etmek istiyor musunuz?')) {
      return;
    }

    try {
      const response = await apiClient.post('/reconciliation/generate-daily');
      
      const successCount = response.data.filter((r: any) => r.status === 'success').length;
      const errorCount = response.data.filter((r: any) => r.status === 'error').length;
      
      toast.success(
        `Mutabakatlar oluşturuldu: ${successCount} başarılı, ${errorCount} hata`,
      );
      
      fetchReconciliations();
    } catch (error: any) {
      toast.error('Mutabakatlar oluşturulurken hata oluştu');
    }
  };

  const handleProcessPayment = async () => {
    if (!selectedReconciliation) return;

    try {
      const amount = parseFloat(paymentForm.amount);
      
      if (isNaN(amount) || amount <= 0) {
        toast.error('Geçerli bir tutar giriniz');
        return;
      }

      if (amount > selectedReconciliation.remainingAmount) {
        toast.error('Ödeme tutarı kalan borçtan fazla olamaz');
        return;
      }

      await apiClient.post(`/reconciliation/${selectedReconciliation.id}/payment`, {
        amount,
        paymentMethod: paymentForm.paymentMethod,
        transactionReference: paymentForm.transactionReference,
        description: paymentForm.description,
      });

      toast.success('Ödeme başarıyla işlendi');
      setShowPaymentDialog(false);
      setPaymentForm({
        amount: '',
        paymentMethod: 'BANK_TRANSFER',
        transactionReference: '',
        description: '',
      });
      fetchReconciliations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ödeme işlenirken hata oluştu');
    }
  };

  const handleApproveReconciliation = async () => {
    if (!selectedReconciliation) return;

    try {
      await apiClient.patch(`/reconciliation/${selectedReconciliation.id}`, {
        status: 'APPROVED',
        notes: approvalForm.notes,
      });

      toast.success('Mutabakat onaylandı');
      setShowApprovalDialog(false);
      setApprovalForm({ notes: '' });
      fetchReconciliations();
    } catch (error: any) {
      toast.error('Mutabakat onaylanırken hata oluştu');
    }
  };

  const handleRejectReconciliation = async () => {
    if (!selectedReconciliation) return;
    
    if (!approvalForm.notes) {
      toast.error('Red nedeni giriniz');
      return;
    }

    try {
      await apiClient.patch(`/reconciliation/${selectedReconciliation.id}`, {
        status: 'REJECTED',
        notes: approvalForm.notes,
      });

      toast.success('Mutabakat reddedildi');
      setShowApprovalDialog(false);
      setApprovalForm({ notes: '' });
      fetchReconciliations();
    } catch (error: any) {
      toast.error('Mutabakat reddedilirken hata oluştu');
    }
  };

  const exportReconciliations = () => {
    const csvContent = [
      ['Tarih', 'Firma', 'Vergi No', 'Toplam Sipariş', 'Teslim Edilen', 'İptal', 'Tutar', 'Ödenen', 'Kalan', 'Durum'],
      ...reconciliations.map(rec => [
        format(new Date(rec.date), 'dd.MM.yyyy'),
        rec.company.name,
        rec.company.taxNumber,
        rec.totalOrders,
        rec.deliveredOrders,
        rec.cancelledOrders,
        rec.netAmount.toFixed(2),
        rec.paidAmount.toFixed(2),
        rec.remainingAmount.toFixed(2),
        ReconciliationStatus[rec.status].label,
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mutabakatlar_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Başlık ve İşlemler */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mutabakat Yönetimi</h1>
          <p className="text-muted-foreground">
            Firma mutabakatlarını yönetin ve ödemeleri takip edin
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={exportReconciliations}
            variant="outline"
            disabled={reconciliations.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Dışa Aktar
          </Button>
          <Button onClick={handleGenerateDailyReconciliations}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Günlük Mutabakatları Oluştur
          </Button>
        </div>
      </div>

      {/* Özet Kartları */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Mutabakat
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalData.totalReconciliations}
            </div>
            <p className="text-xs text-muted-foreground">
              {dateRange === 'current-month' ? 'Bu ay' :
               dateRange === 'last-month' ? 'Geçen ay' : 'Son 3 ay'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Tutar
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₺{totalData.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Net tutar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tahsil Edilen
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₺{totalData.totalPaid.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Ödeme alındı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Kalan Borç
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ₺{totalData.totalRemaining.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Tahsil bekliyor
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtreler */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtreler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger>
                <SelectValue placeholder="Firma seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Firmalar</SelectItem>
                {companies.map(company => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                {Object.entries(ReconciliationStatus).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Tarih aralığı" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-month">Bu Ay</SelectItem>
                <SelectItem value="last-month">Geçen Ay</SelectItem>
                <SelectItem value="last-3-months">Son 3 Ay</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Mutabakat Listesi */}
      <Card>
        <CardHeader>
          <CardTitle>Mutabakatlar</CardTitle>
          <CardDescription>
            Firma mutabakatlarını görüntüleyin ve yönetin
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : reconciliations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Mutabakat kaydı bulunamadı
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Firma</TableHead>
                    <TableHead className="text-center">Sipariş</TableHead>
                    <TableHead className="text-center">Teslim</TableHead>
                    <TableHead className="text-center">İptal</TableHead>
                    <TableHead className="text-right">Net Tutar</TableHead>
                    <TableHead className="text-right">Ödenen</TableHead>
                    <TableHead className="text-right">Kalan</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reconciliations.map((reconciliation) => (
                    <TableRow key={reconciliation.id}>
                      <TableCell>
                        {format(new Date(reconciliation.date), 'dd MMM yyyy', { locale: tr })}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{reconciliation.company.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {reconciliation.company.taxNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {reconciliation.totalOrders}
                      </TableCell>
                      <TableCell className="text-center text-green-600">
                        {reconciliation.deliveredOrders}
                      </TableCell>
                      <TableCell className="text-center text-red-600">
                        {reconciliation.cancelledOrders}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₺{reconciliation.netAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        ₺{reconciliation.paidAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right text-orange-600">
                        ₺{reconciliation.remainingAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge className={ReconciliationStatus[reconciliation.status].color}>
                          {ReconciliationStatus[reconciliation.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => fetchReconciliationDetails(reconciliation.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {reconciliation.status === 'PENDING' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedReconciliation(reconciliation);
                                setShowApprovalDialog(true);
                              }}
                            >
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </Button>
                          )}
                          {reconciliation.remainingAmount > 0 && 
                           reconciliation.status !== 'REJECTED' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedReconciliation(reconciliation);
                                setPaymentForm(prev => ({ 
                                  ...prev, 
                                  amount: reconciliation.remainingAmount.toString() 
                                }));
                                setShowPaymentDialog(true);
                              }}
                            >
                              <CreditCard className="h-4 w-4 text-blue-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.total > pagination.take && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-muted-foreground">
                    Toplam {pagination.total} kayıttan {pagination.skip + 1}-
                    {Math.min(pagination.skip + pagination.take, pagination.total)} arası gösteriliyor
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination(prev => ({ ...prev, skip: Math.max(0, prev.skip - prev.take) }))}
                      disabled={pagination.skip === 0}
                    >
                      Önceki
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination(prev => ({ ...prev, skip: prev.skip + prev.take }))}
                      disabled={pagination.skip + pagination.take >= pagination.total}
                    >
                      Sonraki
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mutabakat Detay Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Mutabakat Detayları</DialogTitle>
            <DialogDescription>
              {selectedReconciliation && format(new Date(selectedReconciliation.date), 'dd MMMM yyyy', { locale: tr })} tarihli mutabakat
            </DialogDescription>
          </DialogHeader>

          {selectedReconciliation && reconciliationDetails && (
            <div className="space-y-4">
              {/* Özet Bilgiler */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Firma</p>
                  <p className="font-medium">{selectedReconciliation.company.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Net Tutar</p>
                  <p className="font-medium">
                    ₺{selectedReconciliation.netAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Ödenen</p>
                  <p className="font-medium text-green-600">
                    ₺{selectedReconciliation.paidAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Kalan</p>
                  <p className="font-medium text-orange-600">
                    ₺{reconciliationDetails.remainingDebt.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <Tabs defaultValue="orders">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="orders">
                    Siparişler ({reconciliationDetails.orders?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="payments">
                    Ödemeler ({reconciliationDetails.payments?.length || 0})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="orders" className="space-y-4">
                  {reconciliationDetails.orders?.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Sipariş No</TableHead>
                          <TableHead>Kurye</TableHead>
                          <TableHead>Tutar</TableHead>
                          <TableHead>Durum</TableHead>
                          <TableHead>Teslimat</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reconciliationDetails.orders.map((order: Order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono">
                              #{order.orderNumber}
                            </TableCell>
                            <TableCell>
                              {order.courier?.fullName || '-'}
                            </TableCell>
                            <TableCell>
                              ₺{order.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell>
                              <Badge variant={order.status === 'DELIVERED' ? 'default' : 'secondary'}>
                                {order.status === 'DELIVERED' ? 'Teslim Edildi' : order.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {order.deliveryTime && 
                                format(new Date(order.deliveryTime), 'HH:mm', { locale: tr })
                              }
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Bu tarihte sipariş bulunmamaktadır.
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>

                <TabsContent value="payments" className="space-y-4">
                  {reconciliationDetails.payments?.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tarih</TableHead>
                          <TableHead>Tutar</TableHead>
                          <TableHead>Yöntem</TableHead>
                          <TableHead>Referans</TableHead>
                          <TableHead>Açıklama</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reconciliationDetails.payments.map((payment: Payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>
                              {format(new Date(payment.processedAt), 'dd.MM.yyyy HH:mm')}
                            </TableCell>
                            <TableCell className="font-medium">
                              ₺{payment.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell>
                              {PaymentMethod[payment.paymentMethod as keyof typeof PaymentMethod] || payment.paymentMethod}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {payment.transactionReference || '-'}
                            </TableCell>
                            <TableCell>
                              {payment.description || '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Bu mutabakat için henüz ödeme kaydı bulunmamaktadır.
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Ödeme Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ödeme Kaydı</DialogTitle>
            <DialogDescription>
              {selectedReconciliation && (
                <>
                  {selectedReconciliation.company.name} - {' '}
                  {format(new Date(selectedReconciliation.date), 'dd MMMM yyyy', { locale: tr })}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedReconciliation && (
            <div className="text-sm text-muted-foreground mb-4">
              Kalan Borç: ₺{selectedReconciliation.remainingAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Ödeme Tutarı</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Ödeme Yöntemi</Label>
              <Select 
                value={paymentForm.paymentMethod} 
                onValueChange={(value) => setPaymentForm(prev => ({ ...prev, paymentMethod: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PaymentMethod).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transactionReference">İşlem Referansı</Label>
              <Input
                id="transactionReference"
                value={paymentForm.transactionReference}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, transactionReference: e.target.value }))}
                placeholder="Dekont no, havale referansı vb."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={paymentForm.description}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="İsteğe bağlı açıklama"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              İptal
            </Button>
            <Button onClick={handleProcessPayment}>
              Ödemeyi Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Onay/Red Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mutabakat Onayı</DialogTitle>
            <DialogDescription>
              {selectedReconciliation && (
                <>
                  {selectedReconciliation.company.name} - {' '}
                  {format(new Date(selectedReconciliation.date), 'dd MMMM yyyy', { locale: tr })}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedReconciliation && (
            <div className="mt-2 space-y-1 text-sm text-muted-foreground mb-4">
              <div>Toplam Sipariş: {selectedReconciliation.totalOrders}</div>
              <div>Teslim Edilen: {selectedReconciliation.deliveredOrders}</div>
              <div>Net Tutar: ₺{selectedReconciliation.netAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notlar</Label>
              <Textarea
                id="notes"
                value={approvalForm.notes}
                onChange={(e) => setApprovalForm({ notes: e.target.value })}
                placeholder="Onay veya red nedeni..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <div>
              <Button 
                variant="destructive" 
                onClick={handleRejectReconciliation}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reddet
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
                İptal
              </Button>
              <Button onClick={handleApproveReconciliation}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Onayla
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}