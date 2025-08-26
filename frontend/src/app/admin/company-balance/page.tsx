'use client';

import { useState, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { 
  Building2, 
  DollarSign, 
  CreditCard, 
  Calendar,
  TrendingUp,
  FileText,
  Plus,
  Eye,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Company {
  id: string;
  name: string;
  status: string;
}

interface CompanyPaymentSummary {
  company: {
    id: string;
    name: string;
  };
  balance: {
    currentDebt: number;
    totalDebts: number;
    totalPayments: number;
    paymentCount: number;
  };
  unpaidReconciliations: {
    count: number;
    totalAmount: number;
    items: any[];
  };
  recentPayments: any[];
}

export default function CompanyBalancePage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [paymentSummary, setPaymentSummary] = useState<CompanyPaymentSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [reconciliationDialog, setReconciliationDialog] = useState(false);
  const [selectedReconciliation, setSelectedReconciliation] = useState<any>(null);
  const [reconciliationDetails, setReconciliationDetails] = useState<any>(null);
  
  // Ödeme formu
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'BANK_TRANSFER',
    transactionReference: '',
    description: '',
    reconciliationId: 'none',
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchPaymentSummary();
    }
  }, [selectedCompany]);

  const fetchCompanies = async () => {
    try {
      const response = await apiClient.get('/companies?take=100');
      setCompanies(response.data.data.filter((c: Company) => c.status === 'APPROVED'));
    } catch (error) {
      console.error('Firmalar yüklenemedi:', error);
      toast.error('Firmalar yüklenemedi');
    }
  };

  const fetchPaymentSummary = async () => {
    if (!selectedCompany) return;
    
    try {
      setLoading(true);
      const response = await apiClient.get(`/company-payments/company/${selectedCompany}/summary`);
      setPaymentSummary(response.data);
    } catch (error) {
      console.error('Firma özeti yüklenemedi:', error);
      toast.error('Firma özeti yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchReconciliationDetails = async (reconciliationId: string) => {
    try {
      const response = await apiClient.get(`/company-payments/reconciliation/${reconciliationId}`);
      setReconciliationDetails(response.data);
    } catch (error) {
      console.error('Mutabakat detayları yüklenemedi:', error);
      toast.error('Mutabakat detayları yüklenemedi');
    }
  };

  const handlePaymentSubmit = async () => {
    if (!selectedCompany || !paymentForm.amount) {
      toast.error('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    try {
      const payload = {
        companyId: selectedCompany,
        amount: parseFloat(paymentForm.amount),
        paymentType: paymentForm.reconciliationId === 'none' ? 'MANUAL_PAYMENT' : 'DAILY_RECONCILIATION',
        paymentMethod: paymentForm.paymentMethod,
        transactionReference: paymentForm.transactionReference || undefined,
        description: paymentForm.description || undefined,
        reconciliationId: paymentForm.reconciliationId === 'none' ? undefined : paymentForm.reconciliationId,
      };

      await apiClient.post('/company-payments', payload);
      
      toast.success('Ödeme başarıyla kaydedildi');
      setPaymentDialog(false);
      setPaymentForm({
        amount: '',
        paymentMethod: 'BANK_TRANSFER',
        transactionReference: '',
        description: '',
        reconciliationId: 'none',
      });
      fetchPaymentSummary();
    } catch (error) {
      console.error('Ödeme kaydedilemedi:', error);
      toast.error('Ödeme kaydedilemedi');
    }
  };

  const viewReconciliation = async (reconciliation: any) => {
    setSelectedReconciliation(reconciliation);
    await fetchReconciliationDetails(reconciliation.id);
    setReconciliationDialog(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="text-orange-600">Bekliyor</Badge>;
      case 'PARTIALLY_PAID':
        return <Badge variant="outline" className="text-blue-600">Kısmi Ödendi</Badge>;
      case 'PAID':
        return <Badge className="bg-green-600">Ödendi</Badge>;
      case 'OVERDUE':
        return <Badge variant="destructive">Gecikmiş</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      CASH: 'Nakit',
      CREDIT_CARD: 'Kredi Kartı',
      BANK_TRANSFER: 'Banka Havalesi',
    };
    return methods[method] || method;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Firma Cari Yönetimi</h1>
          <p className="text-gray-600 mt-2">Firma ödemeleri ve mutabakat işlemleri</p>
        </div>
        <Button onClick={() => setPaymentDialog(true)} disabled={!selectedCompany}>
          <Plus className="w-4 h-4 mr-2" />
          Ödeme Al
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Firma Seçimi</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-full md:w-96">
              <SelectValue placeholder="Firma seçin" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {paymentSummary && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Mevcut Borç</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(paymentSummary.balance.currentDebt)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Toplam Borçlar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(paymentSummary.balance.totalDebts)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Toplam Ödemeler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(paymentSummary.balance.totalPayments)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {paymentSummary.balance.paymentCount} işlem
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Bekleyen Mutabakat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {paymentSummary.unpaidReconciliations.count}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(paymentSummary.unpaidReconciliations.totalAmount)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="reconciliations" className="space-y-6">
            <TabsList className="grid grid-cols-2 w-full max-w-md">
              <TabsTrigger value="reconciliations">Mutabakatlar</TabsTrigger>
              <TabsTrigger value="payments">Ödemeler</TabsTrigger>
            </TabsList>

            <TabsContent value="reconciliations">
              <Card>
                <CardHeader>
                  <CardTitle>Bekleyen Mutabakatlar</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tarih</TableHead>
                        <TableHead className="text-center">Sipariş</TableHead>
                        <TableHead className="text-center">Teslim</TableHead>
                        <TableHead className="text-right">Toplam</TableHead>
                        <TableHead className="text-right">Ödenen</TableHead>
                        <TableHead className="text-right">Kalan</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead className="text-center">İşlem</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentSummary.unpaidReconciliations.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            {format(new Date(item.date), 'dd MMM yyyy', { locale: tr })}
                          </TableCell>
                          <TableCell className="text-center">{item.totalOrders}</TableCell>
                          <TableCell className="text-center">{item.deliveredOrders}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.netAmount)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.paidAmount)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.netAmount - item.paidAmount)}
                          </TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => viewReconciliation(item)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <CardTitle>Son Ödemeler</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tarih</TableHead>
                        <TableHead>Tür</TableHead>
                        <TableHead>Yöntem</TableHead>
                        <TableHead>Referans</TableHead>
                        <TableHead className="text-right">Tutar</TableHead>
                        <TableHead>Açıklama</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentSummary.recentPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            {format(new Date(payment.createdAt), 'dd MMM yyyy HH:mm', { locale: tr })}
                          </TableCell>
                          <TableCell>{payment.paymentType}</TableCell>
                          <TableCell>{getPaymentMethodLabel(payment.paymentMethod)}</TableCell>
                          <TableCell>{payment.transactionReference || '-'}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell>{payment.description || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Ödeme Alma Dialog */}
      <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ödeme Al</DialogTitle>
            <DialogDescription>
              {paymentSummary?.company.name} firmasından ödeme alın
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Tutar*
              </Label>
              <Input
                id="amount"
                type="number"
                className="col-span-3"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="method" className="text-right">
                Yöntem*
              </Label>
              <Select
                value={paymentForm.paymentMethod}
                onValueChange={(value) => setPaymentForm({ ...paymentForm, paymentMethod: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Nakit</SelectItem>
                  <SelectItem value="CREDIT_CARD">Kredi Kartı</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Banka Havalesi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reference" className="text-right">
                Referans
              </Label>
              <Input
                id="reference"
                className="col-span-3"
                value={paymentForm.transactionReference}
                onChange={(e) => setPaymentForm({ ...paymentForm, transactionReference: e.target.value })}
                placeholder="Dekont no, işlem no vb."
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reconciliation" className="text-right">
                Mutabakat
              </Label>
              <Select
                value={paymentForm.reconciliationId}
                onValueChange={(value) => setPaymentForm({ ...paymentForm, reconciliationId: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seçiniz (opsiyonel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Yok</SelectItem>
                  {paymentSummary?.unpaidReconciliations.items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {format(new Date(item.date), 'dd MMM yyyy', { locale: tr })} - 
                      {formatCurrency(item.netAmount - item.paidAmount)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Açıklama
              </Label>
              <Input
                id="description"
                className="col-span-3"
                value={paymentForm.description}
                onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                placeholder="Opsiyonel açıklama"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialog(false)}>
              İptal
            </Button>
            <Button onClick={handlePaymentSubmit}>
              Ödemeyi Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mutabakat Detay Dialog */}
      <Dialog open={reconciliationDialog} onOpenChange={setReconciliationDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Mutabakat Detayları</DialogTitle>
            <DialogDescription>
              {selectedReconciliation && 
                format(new Date(selectedReconciliation.date), 'dd MMMM yyyy', { locale: tr })
              } tarihli mutabakat
            </DialogDescription>
          </DialogHeader>
          {reconciliationDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Toplam Tutar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">
                      {formatCurrency(reconciliationDetails.reconciliation.netAmount)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Ödenen</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold text-green-600">
                      {formatCurrency(reconciliationDetails.reconciliation.paidAmount)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Kalan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold text-red-600">
                      {formatCurrency(reconciliationDetails.remainingDebt)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Siparişler</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sipariş No</TableHead>
                        <TableHead>Kurye</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead className="text-right">Tutar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reconciliationDetails.orders.map((order: any) => (
                        <TableRow key={order.id}>
                          <TableCell>{order.orderNumber}</TableCell>
                          <TableCell>{order.courier?.fullName || '-'}</TableCell>
                          <TableCell>
                            <Badge>{order.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(order.price)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {reconciliationDetails.payments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ödemeler</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tarih</TableHead>
                          <TableHead>Yöntem</TableHead>
                          <TableHead>Referans</TableHead>
                          <TableHead className="text-right">Tutar</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reconciliationDetails.payments.map((payment: any) => (
                          <TableRow key={payment.id}>
                            <TableCell>
                              {format(new Date(payment.createdAt), 'dd MMM HH:mm', { locale: tr })}
                            </TableCell>
                            <TableCell>{getPaymentMethodLabel(payment.paymentMethod)}</TableCell>
                            <TableCell>{payment.transactionReference || '-'}</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(payment.amount)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}