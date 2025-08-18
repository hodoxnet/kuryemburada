"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/shared/LoadingState";
import { 
  FileText,
  Upload,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Camera,
  RefreshCw,
  Plus
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Document {
  id: string;
  type: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  fileName?: string;
  uploadedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  expiryDate?: string;
  notes?: string;
}

const DOCUMENT_TYPES = {
  IDENTITY_CARD: "Kimlik Kartı",
  DRIVER_LICENSE: "Ehliyet", 
  VEHICLE_REGISTRATION: "Araç Ruhsatı",
  INSURANCE: "Sigorta Poliçesi",
  HEALTH_CERTIFICATE: "Sağlık Raporu",
  CRIMINAL_RECORD: "Adli Sicil Belgesi",
  TAX_CERTIFICATE: "Vergi Levhası",
  OTHER: "Diğer"
};

export default function CourierDocuments() {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState("");
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      // TODO: Gerçek API endpoint'i eklendiğinde bu kısım güncellenecek
      // const response = await courierAPI.getMyDocuments();
      
      // Mock data for development
      const mockDocuments: Document[] = [
        {
          id: "1",
          type: "DRIVER_LICENSE",
          status: "APPROVED",
          fileName: "ehliyet.jpg",
          uploadedAt: "2024-01-15T10:00:00Z",
          approvedAt: "2024-01-16T14:30:00Z",
          expiryDate: "2029-01-15"
        },
        {
          id: "2", 
          type: "IDENTITY_CARD",
          status: "APPROVED",
          fileName: "kimlik.jpg",
          uploadedAt: "2024-01-15T10:05:00Z",
          approvedAt: "2024-01-16T14:30:00Z"
        },
        {
          id: "3",
          type: "VEHICLE_REGISTRATION", 
          status: "PENDING",
          fileName: "ruhsat.jpg",
          uploadedAt: "2024-01-20T09:15:00Z"
        },
        {
          id: "4",
          type: "INSURANCE",
          status: "REJECTED",
          fileName: "sigorta.pdf",
          uploadedAt: "2024-01-18T16:20:00Z",
          rejectedAt: "2024-01-19T11:00:00Z",
          rejectionReason: "Belge bulanık ve okunaklı değil. Lütfen daha net bir görüntü yükleyin."
        }
      ];
      
      setDocuments(mockDocuments);
    } catch (error) {
      console.error("Belgeler yüklenemedi:", error);
      toast.error("Belgeler yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Dosya boyutu kontrolü (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Dosya boyutu 5MB'dan küçük olmalıdır");
        return;
      }
      
      // Dosya tipi kontrolü
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Sadece JPG, PNG ve PDF dosyaları kabul edilir");
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentType) {
      toast.error("Lütfen dosya ve belge tipini seçin");
      return;
    }

    try {
      setUploading(true);
      
      // TODO: Gerçek upload API'si eklendiğinde bu kısım güncellenecek
      // const formData = new FormData();
      // formData.append('file', selectedFile);
      // formData.append('type', documentType);
      // formData.append('notes', notes);
      // await courierAPI.uploadDocument(formData);
      
      // Mock success
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Belge başarıyla yüklendi! İnceleme süreci 1-2 iş günü sürecektir.");
      setShowUploadDialog(false);
      setSelectedFile(null);
      setDocumentType("");
      setNotes("");
      loadDocuments(); // Listeyi yenile
      
    } catch (error) {
      console.error("Belge yüklenemedi:", error);
      toast.error("Belge yüklenirken hata oluştu");
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'default';
      case 'PENDING': return 'secondary';
      case 'REJECTED': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'Onaylandı';
      case 'PENDING': return 'İnceleniyor';
      case 'REJECTED': return 'Reddedildi';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return CheckCircle;
      case 'PENDING': return Clock;
      case 'REJECTED': return XCircle;
      default: return Clock;
    }
  };

  const isDocumentExpiring = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isDocumentExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    return expiry < now;
  };

  if (loading) {
    return <LoadingState text="Belgeleriniz yükleniyor..." />;
  }

  const pendingDocs = documents.filter(doc => doc.status === 'PENDING').length;
  const approvedDocs = documents.filter(doc => doc.status === 'APPROVED').length;
  const rejectedDocs = documents.filter(doc => doc.status === 'REJECTED').length;

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Belgelerim</h1>
          <p className="text-muted-foreground">
            Kurye hesabınız için gerekli belgeleri yükleyin ve durumlarını takip edin.
          </p>
        </div>
        <Button onClick={() => setShowUploadDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Belge Yükle
        </Button>
      </div>

      {/* Özet İstatistikleri */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Belge</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground">Yüklenen belge sayısı</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Onaylanan</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedDocs}</div>
            <p className="text-xs text-muted-foreground">Onaylanmış belge</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">İnceleniyor</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingDocs}</div>
            <p className="text-xs text-muted-foreground">Bekleyen belge</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reddedilen</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedDocs}</div>
            <p className="text-xs text-muted-foreground">Reddedilmiş belge</p>
          </CardContent>
        </Card>
      </div>

      {/* Önemli Bildirimler */}
      {documents.some(doc => isDocumentExpiring(doc.expiryDate) || isDocumentExpired(doc.expiryDate)) && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                Dikkat! Süresi dolan veya dolmak üzere olan belgeleriniz var.
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Teslimat hizmetinizin kesintisiz devam etmesi için belgelerinizi güncelleyin.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Belgeler Listesi */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Yüklenen Belgeler</CardTitle>
            <Button variant="outline" size="sm" onClick={loadDocuments}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Yenile
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {documents.length > 0 ? (
            <div className="space-y-4">
              {documents.map((doc) => {
                const StatusIcon = getStatusIcon(doc.status);
                const isExpiring = isDocumentExpiring(doc.expiryDate);
                const isExpired = isDocumentExpired(doc.expiryDate);
                
                return (
                  <div
                    key={doc.id}
                    className={`border rounded-lg p-4 ${
                      isExpired ? 'border-red-200 bg-red-50 dark:bg-red-900/20' :
                      isExpiring ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg dark:bg-gray-800">
                          <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">
                              {DOCUMENT_TYPES[doc.type as keyof typeof DOCUMENT_TYPES] || doc.type}
                            </h3>
                            <Badge variant={getStatusColor(doc.status)}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {getStatusLabel(doc.status)}
                            </Badge>
                            {isExpired && (
                              <Badge variant="destructive">
                                <AlertTriangle className="mr-1 h-3 w-3" />
                                Süresi Dolmuş
                              </Badge>
                            )}
                            {isExpiring && !isExpired && (
                              <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                                <AlertTriangle className="mr-1 h-3 w-3" />
                                Süresi Doluyor
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>Dosya: {doc.fileName}</div>
                            <div>
                              Yükleme: {format(new Date(doc.uploadedAt), "dd MMMM yyyy, HH:mm", { locale: tr })}
                            </div>
                            {doc.expiryDate && (
                              <div>
                                Son Geçerlilik: {format(new Date(doc.expiryDate), "dd MMMM yyyy", { locale: tr })}
                              </div>
                            )}
                            {doc.approvedAt && (
                              <div className="text-green-600">
                                Onaylandı: {format(new Date(doc.approvedAt), "dd MMMM yyyy, HH:mm", { locale: tr })}
                              </div>
                            )}
                            {doc.rejectedAt && (
                              <div className="text-red-600">
                                Reddedildi: {format(new Date(doc.rejectedAt), "dd MMMM yyyy, HH:mm", { locale: tr })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Görüntüle
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          İndir
                        </Button>
                      </div>
                    </div>
                    
                    {doc.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20">
                        <p className="text-sm">
                          <span className="font-medium text-red-800 dark:text-red-200">Red nedeni:</span>
                          <span className="text-red-700 dark:text-red-300 ml-2">{doc.rejectionReason}</span>
                        </p>
                      </div>
                    )}
                    
                    {doc.notes && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20">
                        <p className="text-sm">
                          <span className="font-medium text-blue-800 dark:text-blue-200">Notlar:</span>
                          <span className="text-blue-700 dark:text-blue-300 ml-2">{doc.notes}</span>
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Henüz belge yüklememiş</h3>
              <p className="text-muted-foreground mb-4">
                Kurye hesabınızı aktifleştirmek için gerekli belgeleri yükleyin.
              </p>
              <Button onClick={() => setShowUploadDialog(true)}>
                <Upload className="mr-2 h-4 w-4" />
                İlk Belgeyi Yükle
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Belge Yükleme Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Belge Yükle</DialogTitle>
            <DialogDescription>
              Kurye hesabınız için gerekli belgeyi yükleyin. Desteklenen formatlar: JPG, PNG, PDF (Max: 5MB)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="documentType">Belge Tipi</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Belge tipini seçin" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DOCUMENT_TYPES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Dosya</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  {selectedFile ? (
                    <div className="space-y-2">
                      <FileText className="h-8 w-8 mx-auto text-green-600" />
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                      >
                        Değiştir
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-gray-400" />
                      <div>
                        <input
                          id="file"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          onClick={() => document.getElementById('file')?.click()}
                        >
                          Dosya Seç
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        JPG, PNG veya PDF dosyası seçin
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notlar (İsteğe bağlı)</Label>
              <Input
                id="notes"
                placeholder="Belge ile ilgili ek bilgiler..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUploadDialog(false)}
              disabled={uploading}
            >
              İptal
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !documentType || uploading}
            >
              {uploading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Yükleniyor...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Yükle
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}