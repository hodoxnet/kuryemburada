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
  AlertCircle
} from "lucide-react";
import { companyService, Company } from "@/lib/api/company.service";
import { handleApiError } from "@/lib/api-client";
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

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: "" as "approve" | "reject" | "",
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
        
        {company.status === "PENDING" && (
          <div className="flex gap-2">
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
          </div>
        )}
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
                      : `${company.address.district || ''} ${company.address.city || ''}`}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Banka Bilgileri */}
        {company.bankInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Banka Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {typeof company.bankInfo === 'object' && (
                  <>
                    {company.bankInfo.bankName && (
                      <p><span className="text-muted-foreground">Banka:</span> {company.bankInfo.bankName}</p>
                    )}
                    {company.bankInfo.iban && (
                      <p><span className="text-muted-foreground">IBAN:</span> {company.bankInfo.iban}</p>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

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