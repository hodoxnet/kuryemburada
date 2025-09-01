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
import documentsAPI, { Document } from "@/lib/api/documents";
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

// Document interface documentsAPI'dan import ediliyor

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
      const documents = await documentsAPI.getMyDocuments();
      setDocuments(documents);
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
      
      await documentsAPI.uploadDocument(selectedFile, {
        type: documentType,
        notes: notes || undefined
      });
      
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

  // Belge süre kontrollerini kaldırdık çünkü backend'den expiryDate gelmiyor

  if (loading) {
    return <LoadingState text="Belgeleriniz yükleniyor..." />;
  }

  const pendingDocs = documents.filter(doc => doc.status === 'PENDING').length;
  const approvedDocs = documents.filter(doc => doc.status === 'APPROVED').length;
  const rejectedDocs = documents.filter(doc => doc.status === 'REJECTED').length;

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Başlık */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Belgelerim</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Kurye hesabınız için gerekli belgeleri yükleyin ve durumlarını takip edin.
          </p>
        </div>
        <Button 
          onClick={() => setShowUploadDialog(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Belge Yükle
        </Button>
      </div>

      {/* Özet İstatistikleri - Mobilde 2x2 Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Toplam Belge</CardTitle>
            <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground">Yüklenen belge</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Onaylanan</CardTitle>
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{approvedDocs}</div>
            <p className="text-xs text-muted-foreground">Onaylanmış</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">İnceleniyor</CardTitle>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-yellow-600">{pendingDocs}</div>
            <p className="text-xs text-muted-foreground">Bekleyen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Reddedilen</CardTitle>
            <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-red-600">{rejectedDocs}</div>
            <p className="text-xs text-muted-foreground">Reddedilmiş</p>
          </CardContent>
        </Card>
      </div>


      {/* Belgeler Listesi */}
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg sm:text-xl">Yüklenen Belgeler</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadDocuments}
              className="gap-1 sm:gap-2"
            >
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Yenile</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {documents.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {documents.map((doc) => {
                const StatusIcon = getStatusIcon(doc.status);
                
                return (
                  <div
                    key={doc.id}
                    className="border rounded-lg p-3 sm:p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex items-start gap-2 sm:gap-3 flex-1">
                        <div className="p-1.5 sm:p-2 bg-gray-100 rounded-lg dark:bg-gray-800 shrink-0">
                          <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <h3 className="font-medium text-sm sm:text-base truncate">
                              {DOCUMENT_TYPES[doc.type as keyof typeof DOCUMENT_TYPES] || doc.type}
                            </h3>
                            <Badge variant={getStatusColor(doc.status)} className="w-fit text-xs">
                              <StatusIcon className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              {getStatusLabel(doc.status)}
                            </Badge>
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground space-y-0.5 sm:space-y-1">
                            <div className="truncate">
                              <span className="sm:hidden">Dosya: </span>
                              <span className="font-medium sm:font-normal">{doc.fileName}</span>
                            </div>
                            <div>
                              <span className="hidden sm:inline">Yükleme: </span>
                              {format(new Date(doc.createdAt), "dd MMM yyyy, HH:mm", { locale: tr })}
                            </div>
                            {doc.verifiedAt && (
                              <div className="text-green-600 text-xs sm:text-sm">
                                <span className="hidden sm:inline">Onaylandı: </span>
                                {format(new Date(doc.verifiedAt), "dd MMM yyyy, HH:mm", { locale: tr })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => documentsAPI.viewDocument(doc.id)}
                          className="flex-1 sm:flex-initial text-xs sm:text-sm h-8 sm:h-9"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="ml-1 sm:ml-2">Görüntüle</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => documentsAPI.downloadDocument(doc.id, doc.fileName)}
                          className="flex-1 sm:flex-initial text-xs sm:text-sm h-8 sm:h-9"
                        >
                          <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="ml-1 sm:ml-2">İndir</span>
                        </Button>
                      </div>
                    </div>
                    
                    {doc.rejectionReason && (
                      <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20">
                        <p className="text-xs sm:text-sm">
                          <span className="font-medium text-red-800 dark:text-red-200">Red nedeni:</span>
                          <span className="text-red-700 dark:text-red-300 block sm:inline sm:ml-2 mt-1 sm:mt-0">
                            {doc.rejectionReason}
                          </span>
                        </p>
                      </div>
                    )}
                    
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Henüz belge yüklememiş</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 px-4">
                Kurye hesabınızı aktifleştirmek için gerekli belgeleri yükleyin.
              </p>
              <Button 
                onClick={() => setShowUploadDialog(true)}
                className="w-full sm:w-auto mx-4 sm:mx-0"
              >
                <Upload className="mr-2 h-4 w-4" />
                İlk Belgeyi Yükle
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Belge Yükleme Dialog - Mobilde Tam Ekran */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="w-[95vw] max-w-md sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Belge Yükle</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Kurye hesabınız için gerekli belgeyi yükleyin. Desteklenen formatlar: JPG, PNG, PDF (Max: 5MB)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <Label htmlFor="documentType" className="text-sm sm:text-base">Belge Tipi</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger className="w-full h-10 sm:h-11">
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
              <Label htmlFor="file" className="text-sm sm:text-base">Dosya</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 touch-manipulation">
                <div className="text-center">
                  {selectedFile ? (
                    <div className="space-y-2">
                      <FileText className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-green-600" />
                      <p className="font-medium text-sm sm:text-base truncate px-2">{selectedFile.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                        className="h-8 sm:h-9 text-xs sm:text-sm"
                      >
                        Değiştir
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-gray-400" />
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
                          className="h-10 sm:h-11 px-6 sm:px-4 text-sm sm:text-base touch-manipulation"
                        >
                          Dosya Seç
                        </Button>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        JPG, PNG veya PDF dosyası seçin
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm sm:text-base">Notlar (İsteğe bağlı)</Label>
              <Input
                id="notes"
                placeholder="Belge ile ilgili ek bilgiler..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-10 sm:h-11 text-sm sm:text-base"
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowUploadDialog(false)}
              disabled={uploading}
              className="w-full sm:w-auto h-10 sm:h-11 text-sm sm:text-base order-2 sm:order-1"
            >
              İptal
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !documentType || uploading}
              className="w-full sm:w-auto h-10 sm:h-11 text-sm sm:text-base order-1 sm:order-2"
            >
              {uploading ? (
                <>
                  <RefreshCw className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  Yükleniyor...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
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