"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LoadingState } from "@/components/shared/LoadingState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { 
  ArrowLeft, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  FileText,
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2
} from "lucide-react";
import { companyService, Company, Document } from "@/lib/api/company.service";
import { handleApiError, api } from "@/lib/api-client";
import { toast } from "sonner";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: "" as "approve" | "reject" | "delete" | "",
  });
  const [rejectDialog, setRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const companyId = params.id as string;

  // Firma detaylarını yükle
  const loadCompany = async () => {
    if (!companyId) {
      toast.error("Geçersiz firma ID");
      router.push("/admin/companies");
      return;
    }
    
    try {
      setLoading(true);
      console.log("Loading company with ID:", companyId);
      const data = await companyService.getCompany(companyId);
      console.log("Company data loaded:", data);
      setCompany(data);
    } catch (error) {
      console.error("Error loading company:", error);
      toast.error(handleApiError(error));
      router.push("/admin/companies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      loadCompany();
    }
  }, [companyId]);

  // Onayla
  const handleApprove = async () => {
    try {
      await companyService.updateCompanyStatus(companyId, {
        status: "APPROVED",
      });
      toast.success("Firma başvurusu başarıyla onaylandı");
      loadCompany();
    } catch (error) {
      toast.error(handleApiError(error));
    }
    setConfirmDialog({ open: false, action: "" });
  };

  // Reddet
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Lütfen red gerekçesi girin");
      return;
    }

    try {
      await companyService.updateCompanyStatus(companyId, {
        status: "REJECTED",
        rejectionReason: rejectionReason.trim(),
      });
      toast.success("Firma başvurusu reddedildi");
      loadCompany();
      setRejectDialog(false);
      setRejectionReason("");
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  // Sil
  const handleDelete = async () => {
    try {
      await companyService.deleteCompany(companyId);
      toast.success("Firma başarıyla silindi");
      router.push("/admin/companies");
    } catch (error) {
      toast.error(handleApiError(error));
    }
    setConfirmDialog({ open: false, action: "" });
  };

  // Belge onaylama
  const handleApproveDocument = async (documentId: string) => {
    try {
      await api.put(`/documents/${documentId}/verify`);
      toast.success("Belge onaylandı");
      loadCompany();
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  // Belge reddetme
  const handleRejectDocument = async (documentId: string, reason: string) => {
    try {
      await api.put(`/documents/${documentId}/reject`, { reason });
      toast.success("Belge reddedildi");
      loadCompany();
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  if (loading) {
    return <LoadingState text="Firma bilgileri yükleniyor..." />;
  }

  if (!company) {
    return <div>Firma bulunamadı</div>;
  }

  return (
    <div className="space-y-6">
      {/* Üst Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/companies")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{company.name}</h1>
            <p className="text-sm text-muted-foreground">
              Firma Detayları
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {company.status === "PENDING" && (
            <>
              <Button
                variant="default"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setConfirmDialog({ open: true, action: "approve" })}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Onayla
              </Button>
              <Button
                variant="destructive"
                onClick={() => setRejectDialog(true)}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reddet
              </Button>
            </>
          )}
          {(company.status === "APPROVED" || company.status === "REJECTED") && (
            <Button
              variant="destructive"
              onClick={() => setConfirmDialog({ open: true, action: "delete" })}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Firmayı Sil
            </Button>
          )}
        </div>
      </div>

      {/* Durum Kartı */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <StatusBadge status={company.status as any} />
              <span className="text-sm text-muted-foreground">
                Başvuru Tarihi: {format(new Date(company.createdAt), "dd MMMM yyyy HH:mm", { locale: tr })}
              </span>
            </div>
            {company.approvedAt && (
              <span className="text-sm text-green-600">
                Onay Tarihi: {format(new Date(company.approvedAt), "dd MMMM yyyy", { locale: tr })}
              </span>
            )}
            {company.rejectedAt && (
              <span className="text-sm text-red-600">
                Red Tarihi: {format(new Date(company.rejectedAt), "dd MMMM yyyy", { locale: tr })}
              </span>
            )}
          </div>
          {company.rejectionReason && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900 dark:text-red-400">Red Gerekçesi:</p>
                  <p className="text-sm text-red-800 dark:text-red-300 mt-1">
                    {company.rejectionReason}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detaylı Bilgiler */}
      <Tabs defaultValue="company" className="space-y-4">
        <TabsList>
          <TabsTrigger value="company">Firma Bilgileri</TabsTrigger>
          <TabsTrigger value="contact">Yetkili Kişi</TabsTrigger>
          <TabsTrigger value="documents">Belgeler</TabsTrigger>
          <TabsTrigger value="bank">Banka Bilgileri</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Firma Bilgileri */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Firma Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Firma Adı</Label>
                  <p className="font-medium">{company.name}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-muted-foreground">Vergi Numarası</Label>
                  <p className="font-medium">{company.taxNumber}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-muted-foreground">Vergi Dairesi</Label>
                  <p className="font-medium">{company.taxOffice}</p>
                </div>
                {company.kepAddress && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-muted-foreground">KEP Adresi</Label>
                      <p className="font-medium">{company.kepAddress}</p>
                    </div>
                  </>
                )}
                {company.tradeLicenseNo && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-muted-foreground">Ticaret Sicil No</Label>
                      <p className="font-medium">{company.tradeLicenseNo}</p>
                    </div>
                  </>
                )}
                {company.activityArea && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-muted-foreground">Faaliyet Alanı</Label>
                      <p className="font-medium">{company.activityArea}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* İletişim Bilgileri */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  İletişim Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Telefon</Label>
                  <p className="font-medium">{company.phone}</p>
                </div>
                {company.address && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-muted-foreground">Adres</Label>
                      <p className="font-medium">
                        {typeof company.address === 'string' 
                          ? company.address 
                          : `${company.address.street || ''} ${company.address.neighborhood || ''} ${company.address.district || ''} ${company.address.city || ''}`}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Yetkili Kişi Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent>
              {company.contactPerson ? (
                <div className="space-y-4">
                  {company.contactPerson.name && (
                    <div>
                      <Label className="text-muted-foreground">Ad Soyad</Label>
                      <p className="font-medium">{company.contactPerson.name}</p>
                    </div>
                  )}
                  {company.contactPerson.title && (
                    <>
                      <Separator />
                      <div>
                        <Label className="text-muted-foreground">Unvan</Label>
                        <p className="font-medium">{company.contactPerson.title}</p>
                      </div>
                    </>
                  )}
                  {company.contactPerson.phone && (
                    <>
                      <Separator />
                      <div>
                        <Label className="text-muted-foreground">Telefon</Label>
                        <p className="font-medium">{company.contactPerson.phone}</p>
                      </div>
                    </>
                  )}
                  {company.contactPerson.email && (
                    <>
                      <Separator />
                      <div>
                        <Label className="text-muted-foreground">E-posta</Label>
                        <p className="font-medium">{company.contactPerson.email}</p>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Yetkili kişi bilgisi bulunmuyor</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Belgeler
              </CardTitle>
            </CardHeader>
            <CardContent>
              {company.documents && company.documents.length > 0 ? (
                <div className="space-y-4">
                  {company.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">
                            {doc.type === 'TAX_CERTIFICATE' && 'Vergi Levhası'}
                            {doc.type === 'TRADE_LICENSE' && 'Ticaret Sicil Gazetesi'}
                            {doc.type === 'KEP_ADDRESS' && 'KEP Adresi Belgesi'}
                            {doc.type === 'IDENTITY_CARD' && 'Kimlik Kartı'}
                            {doc.type === 'OTHER' && 'Diğer'}
                            {!['TAX_CERTIFICATE', 'TRADE_LICENSE', 'KEP_ADDRESS', 'IDENTITY_CARD', 'OTHER'].includes(doc.type) && doc.type}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {doc.fileName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Yüklenme: {format(new Date(doc.createdAt), "dd MMM yyyy HH:mm", { locale: tr })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={doc.status as any} />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/documents/${doc.id}/download`, '_blank')}
                          >
                            İndir
                          </Button>
                          {doc.status === "PENDING" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600"
                                onClick={() => handleApproveDocument(doc.id)}
                              >
                                Onayla
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600"
                                onClick={() => {
                                  const reason = prompt("Red gerekçesi:");
                                  if (reason) handleRejectDocument(doc.id, reason);
                                }}
                              >
                                Reddet
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Henüz belge yüklenmemiş</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bank">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Banka Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent>
              {company.bankInfo ? (
                <div className="space-y-4">
                  {company.bankInfo.bankName && (
                    <div>
                      <Label className="text-muted-foreground">Banka</Label>
                      <p className="font-medium">{company.bankInfo.bankName}</p>
                    </div>
                  )}
                  {company.bankInfo.iban && (
                    <>
                      <Separator />
                      <div>
                        <Label className="text-muted-foreground">IBAN</Label>
                        <p className="font-medium font-mono">{company.bankInfo.iban}</p>
                      </div>
                    </>
                  )}
                  {company.bankInfo.accountHolder && (
                    <>
                      <Separator />
                      <div>
                        <Label className="text-muted-foreground">Hesap Sahibi</Label>
                        <p className="font-medium">{company.bankInfo.accountHolder}</p>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Banka bilgisi bulunmuyor</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Onay Dialog */}
      <ConfirmDialog
        open={confirmDialog.open && confirmDialog.action === "approve"}
        onOpenChange={(open) => setConfirmDialog({ open, action: "" })}
        title="Firma Başvurusunu Onayla"
        description={`${company.name} firmasının başvurusunu onaylamak istediğinizden emin misiniz?`}
        onConfirm={handleApprove}
        confirmText="Onayla"
        cancelText="İptal"
      />

      {/* Silme Dialog */}
      <ConfirmDialog
        open={confirmDialog.open && confirmDialog.action === "delete"}
        onOpenChange={(open) => setConfirmDialog({ open, action: "" })}
        title="Firmayı Sil"
        description={`${company.name} firmasını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        onConfirm={handleDelete}
        confirmText="Evet, Sil"
        cancelText="İptal"
      />

      {/* Red Dialog */}
      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Firma Başvurusunu Reddet</DialogTitle>
            <DialogDescription>
              {company.name} firmasının başvurusunu reddetmek için gerekçe belirtiniz.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Red Gerekçesi</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Red gerekçesini yazınız..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(false)}>
              İptal
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reddet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}