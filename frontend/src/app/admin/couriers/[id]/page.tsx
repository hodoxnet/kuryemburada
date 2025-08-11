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
  User, 
  Phone, 
  Mail, 
  MapPin, 
  FileText,
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Car,
  Star,
  Package,
  IdCard,
  UserCheck,
  Cake
} from "lucide-react";
import { courierService, Courier } from "@/lib/api/courier.service";
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

export default function CourierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [courier, setCourier] = useState<Courier | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: "" as "approve" | "reject" | "",
  });
  const [rejectDialog, setRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const courierId = params.id as string;

  // Kurye detaylarını yükle
  const loadCourier = async () => {
    if (!courierId) {
      toast.error("Geçersiz kurye ID");
      router.push("/admin/couriers");
      return;
    }
    
    try {
      setLoading(true);
      console.log("Loading courier with ID:", courierId);
      const data = await courierService.getCourier(courierId);
      console.log("Courier data loaded:", data);
      setCourier(data);
    } catch (error) {
      console.error("Error loading courier:", error);
      toast.error(handleApiError(error));
      router.push("/admin/couriers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courierId) {
      loadCourier();
    }
  }, [courierId]);

  // Onayla
  const handleApprove = async () => {
    try {
      await courierService.updateCourierStatus(courierId, {
        status: "APPROVED",
      });
      toast.success("Kurye başvurusu başarıyla onaylandı");
      loadCourier();
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
      await courierService.updateCourierStatus(courierId, {
        status: "REJECTED",
        rejectionReason: rejectionReason.trim(),
      });
      toast.success("Kurye başvurusu reddedildi");
      loadCourier();
      setRejectDialog(false);
      setRejectionReason("");
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  // Belge onaylama
  const handleApproveDocument = async (documentId: string) => {
    try {
      await api.put(`/documents/${documentId}/verify`);
      toast.success("Belge onaylandı");
      loadCourier();
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  // Belge reddetme
  const handleRejectDocument = async (documentId: string, reason: string) => {
    try {
      await api.put(`/documents/${documentId}/reject`, { reason });
      toast.success("Belge reddedildi");
      loadCourier();
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  if (loading) {
    return <LoadingState text="Kurye bilgileri yükleniyor..." />;
  }

  if (!courier) {
    return <div>Kurye bulunamadı</div>;
  }

  return (
    <div className="space-y-6">
      {/* Üst Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/couriers")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{courier.fullName}</h1>
            <p className="text-sm text-muted-foreground">
              Kurye Detayları
            </p>
          </div>
        </div>
        
        {courier.status === "PENDING" && (
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
              <StatusBadge status={courier.status as any} />
              <span className="text-sm text-muted-foreground">
                Başvuru Tarihi: {format(new Date(courier.createdAt), "dd MMMM yyyy HH:mm", { locale: tr })}
              </span>
              {courier.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{courier.rating.toFixed(1)}</span>
                </div>
              )}
              {courier.totalDeliveries !== undefined && (
                <Badge variant="secondary">
                  <Package className="mr-1 h-3 w-3" />
                  {courier.totalDeliveries} Teslimat
                </Badge>
              )}
            </div>
            {courier.approvedAt && (
              <span className="text-sm text-green-600">
                Onay Tarihi: {format(new Date(courier.approvedAt), "dd MMMM yyyy", { locale: tr })}
              </span>
            )}
            {courier.rejectedAt && (
              <span className="text-sm text-red-600">
                Red Tarihi: {format(new Date(courier.rejectedAt), "dd MMMM yyyy", { locale: tr })}
              </span>
            )}
          </div>
          {courier.rejectionReason && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900 dark:text-red-400">Red Gerekçesi:</p>
                  <p className="text-sm text-red-800 dark:text-red-300 mt-1">
                    {courier.rejectionReason}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detaylı Bilgiler */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Kişisel Bilgiler</TabsTrigger>
          <TabsTrigger value="vehicle">Araç Bilgileri</TabsTrigger>
          <TabsTrigger value="documents">Belgeler</TabsTrigger>
          <TabsTrigger value="bank">Banka Bilgileri</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Kişisel Bilgiler */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Kişisel Bilgiler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Ad Soyad</Label>
                  <p className="font-medium">{courier.fullName}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-muted-foreground">TC Kimlik No</Label>
                  <p className="font-medium">{courier.tcNumber}</p>
                </div>
                {courier.birthDate && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-muted-foreground">Doğum Tarihi</Label>
                      <p className="font-medium">
                        {format(new Date(courier.birthDate), "dd MMMM yyyy", { locale: tr })}
                      </p>
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
                  <p className="font-medium">{courier.phone}</p>
                </div>
                {courier.emergencyContact && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-muted-foreground">Acil Durum İletişim</Label>
                      {typeof courier.emergencyContact === 'object' && (
                        <div className="space-y-1">
                          {courier.emergencyContact.name && (
                            <p className="font-medium">{courier.emergencyContact.name}</p>
                          )}
                          {courier.emergencyContact.phone && (
                            <p className="text-sm text-muted-foreground">{courier.emergencyContact.phone}</p>
                          )}
                          {courier.emergencyContact.relation && (
                            <p className="text-sm text-muted-foreground">({courier.emergencyContact.relation})</p>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vehicle" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Araç Bilgileri */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Araç Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent>
                {courier.vehicleInfo ? (
                  <div className="space-y-4">
                    {courier.vehicleInfo.brand && (
                      <div>
                        <Label className="text-muted-foreground">Marka / Model</Label>
                        <p className="font-medium">
                          {courier.vehicleInfo.brand} {courier.vehicleInfo.model || ''}
                        </p>
                      </div>
                    )}
                    {courier.vehicleInfo.plate && (
                      <>
                        <Separator />
                        <div>
                          <Label className="text-muted-foreground">Plaka</Label>
                          <p className="font-medium">{courier.vehicleInfo.plate}</p>
                        </div>
                      </>
                    )}
                    {courier.vehicleInfo.year && (
                      <>
                        <Separator />
                        <div>
                          <Label className="text-muted-foreground">Model Yılı</Label>
                          <p className="font-medium">{courier.vehicleInfo.year}</p>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Araç bilgisi bulunmuyor</p>
                )}
              </CardContent>
            </Card>

            {/* Ehliyet Bilgileri */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IdCard className="h-5 w-5" />
                  Ehliyet Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent>
                {courier.licenseInfo ? (
                  <div className="space-y-4">
                    {courier.licenseInfo.type && (
                      <div>
                        <Label className="text-muted-foreground">Ehliyet Sınıfı</Label>
                        <p className="font-medium">{courier.licenseInfo.type}</p>
                      </div>
                    )}
                    {courier.licenseInfo.issueDate && (
                      <>
                        <Separator />
                        <div>
                          <Label className="text-muted-foreground">Veriliş Tarihi</Label>
                          <p className="font-medium">{courier.licenseInfo.issueDate}</p>
                        </div>
                      </>
                    )}
                    {courier.licenseInfo.expiryDate && (
                      <>
                        <Separator />
                        <div>
                          <Label className="text-muted-foreground">Geçerlilik Tarihi</Label>
                          <p className="font-medium">{courier.licenseInfo.expiryDate}</p>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Ehliyet bilgisi bulunmuyor</p>
                )}
              </CardContent>
            </Card>
          </div>
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
              {courier.documents && courier.documents.length > 0 ? (
                <div className="space-y-4">
                  {courier.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">
                          {doc.type === 'IDENTITY_CARD' && 'Kimlik Kartı'}
                          {doc.type === 'DRIVER_LICENSE' && 'Ehliyet'}
                          {doc.type === 'VEHICLE_REGISTRATION' && 'Araç Ruhsatı'}
                          {doc.type === 'CRIMINAL_RECORD' && 'Adli Sicil Belgesi'}
                          {doc.type === 'ADDRESS_PROOF' && 'İkametgah'}
                          {doc.type === 'HEALTH_REPORT' && 'Sağlık Raporu'}
                          {doc.type === 'INSURANCE' && 'Sigorta'}
                          {doc.type === 'OTHER' && 'Diğer'}
                          {!['IDENTITY_CARD', 'DRIVER_LICENSE', 'VEHICLE_REGISTRATION', 'CRIMINAL_RECORD', 'ADDRESS_PROOF', 'HEALTH_REPORT', 'INSURANCE', 'OTHER'].includes(doc.type) && doc.type}
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
              {courier.bankInfo ? (
                <div className="space-y-4">
                  {courier.bankInfo.bankName && (
                    <div>
                      <Label className="text-muted-foreground">Banka</Label>
                      <p className="font-medium">{courier.bankInfo.bankName}</p>
                    </div>
                  )}
                  {courier.bankInfo.iban && (
                    <>
                      <Separator />
                      <div>
                        <Label className="text-muted-foreground">IBAN</Label>
                        <p className="font-medium font-mono">{courier.bankInfo.iban}</p>
                      </div>
                    </>
                  )}
                  {courier.bankInfo.accountHolder && (
                    <>
                      <Separator />
                      <div>
                        <Label className="text-muted-foreground">Hesap Sahibi</Label>
                        <p className="font-medium">{courier.bankInfo.accountHolder}</p>
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
        title="Kurye Başvurusunu Onayla"
        description={`${courier.fullName} isimli kuryenin başvurusunu onaylamak istediğinizden emin misiniz?`}
        onConfirm={handleApprove}
        confirmText="Onayla"
        cancelText="İptal"
      />

      {/* Red Dialog */}
      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kurye Başvurusunu Reddet</DialogTitle>
            <DialogDescription>
              {courier.fullName} isimli kuryenin başvurusunu reddetmek için gerekçe belirtiniz.
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