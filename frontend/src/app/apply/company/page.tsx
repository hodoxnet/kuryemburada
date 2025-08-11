"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { 
  Building2, 
  Phone, 
  Mail, 
  FileText, 
  Upload, 
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CreditCard,
  Shield,
  MapPin,
  User,
  Briefcase,
  Globe
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { applicationService, CompanyApplicationData } from "@/lib/api/application.service";

interface CompanyFormData {
  // Firma Bilgileri
  companyName: string;
  taxNumber: string;
  taxOffice: string;
  tradeLicenseNo: string;
  kepAddress: string;
  
  // İletişim
  companyPhone: string;
  companyEmail: string;
  website: string;
  
  // Adres
  city: string;
  district: string;
  address: string;
  
  // Yetkili Kişi
  contactName: string;
  contactTitle: string;
  contactPhone: string;
  contactEmail: string;
  
  // Faaliyet Bilgileri
  activityArea: string;
  employeeCount: string;
  monthlyShipmentVolume: string;
  currentLogisticsProvider: string;
  
  // Banka Bilgileri
  bankName: string;
  iban: string;
  accountHolder: string;
  
  // Hesap Bilgileri
  email: string;
  password: string;
  
  // Belgeler
  taxCertificate: File | null;
  tradeLicense: File | null;
  signatureCircular: File | null;
  
  // Sözleşmeler
  termsAccepted: boolean;
  kvkkAccepted: boolean;
  corporateAgreement: boolean;
}

const initialFormData: CompanyFormData = {
  companyName: "",
  taxNumber: "",
  taxOffice: "",
  tradeLicenseNo: "",
  kepAddress: "",
  companyPhone: "",
  companyEmail: "",
  website: "",
  city: "",
  district: "",
  address: "",
  contactName: "",
  contactTitle: "",
  contactPhone: "",
  contactEmail: "",
  activityArea: "",
  employeeCount: "",
  monthlyShipmentVolume: "",
  currentLogisticsProvider: "",
  bankName: "",
  iban: "",
  accountHolder: "",
  email: "",
  password: "",
  taxCertificate: null,
  tradeLicense: null,
  signatureCircular: null,
  termsAccepted: false,
  kvkkAccepted: false,
  corporateAgreement: false,
};

const steps = [
  { id: 1, title: "Firma Bilgileri", icon: Building2 },
  { id: 2, title: "İletişim & Adres", icon: MapPin },
  { id: 3, title: "Yetkili Kişi", icon: User },
  { id: 4, title: "Faaliyet Bilgileri", icon: Briefcase },
  { id: 5, title: "Finansal Bilgiler", icon: CreditCard },
  { id: 6, title: "Belgeler", icon: FileText },
  { id: 7, title: "Onay", icon: CheckCircle },
];

const activityAreas = [
  "E-ticaret",
  "Restoran / Yemek",
  "Market / Süpermarket",
  "Eczane / Sağlık",
  "Tekstil / Giyim",
  "Elektronik",
  "Kozmetik / Güzellik",
  "Kitap / Kırtasiye",
  "Çiçekçi",
  "Kurumsal / B2B",
  "Diğer"
];

const employeeRanges = [
  "1-10",
  "11-50",
  "51-100",
  "101-250",
  "251-500",
  "500+"
];

const shipmentVolumes = [
  "0-50",
  "51-100",
  "101-250",
  "251-500",
  "501-1000",
  "1000+"
];

export default function CompanyApplicationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CompanyFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof CompanyFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (field: keyof CompanyFormData, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.companyName || !formData.taxNumber || !formData.taxOffice) {
          toast.error("Lütfen zorunlu firma bilgilerini doldurun");
          return false;
        }
        if (formData.taxNumber.length !== 10 && formData.taxNumber.length !== 11) {
          toast.error("Vergi numarası 10 veya 11 haneli olmalıdır");
          return false;
        }
        return true;
      
      case 2:
        if (!formData.companyPhone || !formData.companyEmail) {
          toast.error("Lütfen iletişim bilgilerini doldurun");
          return false;
        }
        if (!formData.city || !formData.district || !formData.address) {
          toast.error("Lütfen adres bilgilerini doldurun");
          return false;
        }
        return true;
      
      case 3:
        if (!formData.contactName || !formData.contactTitle || !formData.contactPhone || !formData.contactEmail) {
          toast.error("Lütfen yetkili kişi bilgilerini doldurun");
          return false;
        }
        return true;
      
      case 4:
        if (!formData.activityArea || !formData.employeeCount || !formData.monthlyShipmentVolume) {
          toast.error("Lütfen faaliyet bilgilerini doldurun");
          return false;
        }
        return true;
      
      case 5:
        if (!formData.email || !formData.password) {
          toast.error("Lütfen hesap bilgilerini doldurun");
          return false;
        }
        if (formData.password.length < 6) {
          toast.error("Şifre en az 6 karakter olmalıdır");
          return false;
        }
        if (!formData.bankName || !formData.iban || !formData.accountHolder) {
          toast.error("Lütfen banka bilgilerini doldurun");
          return false;
        }
        return true;
      
      case 6:
        if (!formData.taxCertificate) {
          toast.error("Lütfen vergi levhası yükleyin");
          return false;
        }
        return true;
      
      case 7:
        if (!formData.termsAccepted || !formData.kvkkAccepted || !formData.corporateAgreement) {
          toast.error("Lütfen tüm sözleşmeleri onaylayın");
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    
    try {
      // API için veri hazırla
      const applicationData: CompanyApplicationData = {
        email: formData.email,
        password: formData.password,
        name: formData.companyName,
        taxNumber: formData.taxNumber,
        taxOffice: formData.taxOffice,
        phone: formData.companyPhone,
        companyEmail: formData.companyEmail,
        address: {
          city: formData.city,
          district: formData.district,
          neighborhood: formData.address.split(',')[0] || 'Merkez',
          street: formData.address.split(',')[1] || formData.address,
          detail: formData.address,
        },
        contactPerson: {
          name: formData.contactName,
          phone: formData.contactPhone,
          email: formData.contactEmail,
          title: formData.contactTitle,
        },
      };

      // Opsiyonel alanları ekle
      if (formData.kepAddress) {
        applicationData.kepAddress = formData.kepAddress;
      }

      if (formData.tradeLicenseNo) {
        applicationData.tradeLicenseNo = formData.tradeLicenseNo;
      }

      if (formData.activityArea) {
        applicationData.activityArea = formData.activityArea;
      }

      if (formData.website) {
        applicationData.website = formData.website;
      }

      if (formData.bankName && formData.iban) {
        applicationData.bankInfo = {
          bankName: formData.bankName,
          iban: formData.iban,
          accountHolder: formData.accountHolder,
        };
      }

      if (formData.employeeCount) {
        applicationData.employeeCount = formData.employeeCount;
      }

      if (formData.monthlyShipmentVolume) {
        applicationData.monthlyShipmentVolume = formData.monthlyShipmentVolume;
      }

      if (formData.currentLogisticsProvider) {
        applicationData.currentLogisticsProvider = formData.currentLogisticsProvider;
      }

      // Belgeleri hazırla
      const files: { [key: string]: File } = {};
      if (formData.taxCertificate) files.taxCertificate = formData.taxCertificate;
      if (formData.tradeLicense) files.tradeLicense = formData.tradeLicense;
      if (formData.signatureCircular) files.signatureCircular = formData.signatureCircular;
      
      // Başvuruyu ve belgeleri gönder
      const response = await applicationService.submitCompanyApplication(applicationData, files);
      
      toast.success("Başvurunuz başarıyla alındı! En kısa sürede size dönüş yapacağız.");
      router.push("/apply/success");
      
    } catch (error: any) {
      toast.error(error.message || "Başvuru sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Firma Unvanı *</Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="ABC Teknoloji A.Ş."
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                />
                <p className="text-xs text-gray-500">Ticaret sicilinde kayıtlı tam unvan</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxNumber">Vergi No *</Label>
                  <Input
                    id="taxNumber"
                    type="text"
                    maxLength={11}
                    placeholder="1234567890"
                    value={formData.taxNumber}
                    onChange={(e) => handleInputChange('taxNumber', e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="taxOffice">Vergi Dairesi *</Label>
                  <Input
                    id="taxOffice"
                    type="text"
                    placeholder="Kadıköy Vergi Dairesi"
                    value={formData.taxOffice}
                    onChange={(e) => handleInputChange('taxOffice', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tradeLicenseNo">Ticaret Sicil No</Label>
                  <Input
                    id="tradeLicenseNo"
                    type="text"
                    placeholder="123456"
                    value={formData.tradeLicenseNo}
                    onChange={(e) => handleInputChange('tradeLicenseNo', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="kepAddress">KEP Adresi</Label>
                  <Input
                    id="kepAddress"
                    type="email"
                    placeholder="firma@hs01.kep.tr"
                    value={formData.kepAddress}
                    onChange={(e) => handleInputChange('kepAddress', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-600 dark:text-blue-400">
                <p className="font-medium mb-1">Önemli Bilgi</p>
                <p>Firma bilgileriniz fatura kesimi ve resmi işlemler için kullanılacaktır. Lütfen doğru bilgi girdiğinizden emin olun.</p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">İletişim Bilgileri</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Firma Telefonu *</Label>
                  <Input
                    id="companyPhone"
                    type="tel"
                    placeholder="0212 XXX XX XX"
                    value={formData.companyPhone}
                    onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Firma E-posta *</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    placeholder="info@firma.com"
                    value={formData.companyEmail}
                    onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Web Sitesi</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://www.firma.com"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Adres Bilgileri</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">İl *</Label>
                  <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="İl seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="istanbul">İstanbul</SelectItem>
                      <SelectItem value="ankara">Ankara</SelectItem>
                      <SelectItem value="izmir">İzmir</SelectItem>
                      <SelectItem value="bursa">Bursa</SelectItem>
                      <SelectItem value="antalya">Antalya</SelectItem>
                      <SelectItem value="adana">Adana</SelectItem>
                      <SelectItem value="konya">Konya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="district">İlçe *</Label>
                  <Select value={formData.district} onValueChange={(value) => handleInputChange('district', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="İlçe seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kadikoy">Kadıköy</SelectItem>
                      <SelectItem value="besiktas">Beşiktaş</SelectItem>
                      <SelectItem value="sisli">Şişli</SelectItem>
                      <SelectItem value="uskudar">Üsküdar</SelectItem>
                      <SelectItem value="maltepe">Maltepe</SelectItem>
                      <SelectItem value="atasehir">Ataşehir</SelectItem>
                      <SelectItem value="umraniye">Ümraniye</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Açık Adres *</Label>
                <Textarea
                  id="address"
                  placeholder="Mahalle, sokak, bina no, kat, daire vb. detaylı adres bilgisi"
                  rows={4}
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Firma adına işlem yapma yetkisine sahip kişinin bilgileri
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Ad Soyad *</Label>
                <Input
                  id="contactName"
                  type="text"
                  placeholder="Mehmet Demir"
                  value={formData.contactName}
                  onChange={(e) => handleInputChange('contactName', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactTitle">Unvan *</Label>
                <Input
                  id="contactTitle"
                  type="text"
                  placeholder="Genel Müdür / Satın Alma Müdürü"
                  value={formData.contactTitle}
                  onChange={(e) => handleInputChange('contactTitle', e.target.value)}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Telefon *</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  placeholder="5XX XXX XX XX"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactEmail">E-posta *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="yetkili@firma.com"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                />
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg flex items-start space-x-3">
              <User className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-600 dark:text-amber-400">
                <p className="font-medium mb-1">Not</p>
                <p>Yetkili kişiye sistem kullanımı ve önemli bildirimler için ulaşılacaktır.</p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="activityArea">Faaliyet Alanı *</Label>
                <Select value={formData.activityArea} onValueChange={(value) => handleInputChange('activityArea', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Faaliyet alanınızı seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {activityAreas.map((area) => (
                      <SelectItem key={area} value={area.toLowerCase()}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeCount">Çalışan Sayısı *</Label>
                  <Select value={formData.employeeCount} onValueChange={(value) => handleInputChange('employeeCount', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {employeeRanges.map((range) => (
                        <SelectItem key={range} value={range}>
                          {range}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="monthlyShipmentVolume">Aylık Gönderi Adedi *</Label>
                  <Select value={formData.monthlyShipmentVolume} onValueChange={(value) => handleInputChange('monthlyShipmentVolume', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {shipmentVolumes.map((volume) => (
                        <SelectItem key={volume} value={volume}>
                          {volume} gönderi
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentLogisticsProvider">Mevcut Kargo/Kurye Firması</Label>
                <Input
                  id="currentLogisticsProvider"
                  type="text"
                  placeholder="Örn: Yurtiçi Kargo, MNG, Aras vb."
                  value={formData.currentLogisticsProvider}
                  onChange={(e) => handleInputChange('currentLogisticsProvider', e.target.value)}
                />
                <p className="text-xs text-gray-500">Varsa şu anda çalıştığınız lojistik firmalar</p>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
              <h4 className="font-medium mb-2 text-green-800 dark:text-green-200">
                Size Özel Avantajlar
              </h4>
              <ul className="text-sm space-y-1 text-green-700 dark:text-green-300">
                <li>• Gönderi hacminize göre özel fiyatlandırma</li>
                <li>• Kurumsal müşteri temsilcisi desteği</li>
                <li>• API entegrasyonu imkanı</li>
                <li>• Detaylı raporlama ve analiz</li>
              </ul>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-medium">Hesap Bilgileri</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sisteme giriş için kullanacağınız bilgiler
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="kullanici@firma.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Şifre *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="En az 6 karakter"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-medium">Banka Bilgileri</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ödemeleriniz için kullanılacak hesap bilgileri
              </p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Banka Adı *</Label>
                  <Select value={formData.bankName} onValueChange={(value) => handleInputChange('bankName', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Banka seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ziraat">Ziraat Bankası</SelectItem>
                      <SelectItem value="garanti">Garanti BBVA</SelectItem>
                      <SelectItem value="isbank">İş Bankası</SelectItem>
                      <SelectItem value="akbank">Akbank</SelectItem>
                      <SelectItem value="yapikredi">Yapı Kredi</SelectItem>
                      <SelectItem value="qnb">QNB Finansbank</SelectItem>
                      <SelectItem value="denizbank">DenizBank</SelectItem>
                      <SelectItem value="vakifbank">VakıfBank</SelectItem>
                      <SelectItem value="halkbank">Halkbank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accountHolder">Hesap Sahibi *</Label>
                  <Input
                    id="accountHolder"
                    type="text"
                    placeholder="Firma unvanı veya yetkili adı"
                    value={formData.accountHolder}
                    onChange={(e) => handleInputChange('accountHolder', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="iban">IBAN *</Label>
                  <Input
                    id="iban"
                    type="text"
                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                    value={formData.iban}
                    onChange={(e) => handleInputChange('iban', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="grid gap-4">
              <div className="p-4 border-2 border-dashed rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Label>Vergi Levhası *</Label>
                  {formData.taxCertificate && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <Input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileChange('taxCertificate', e.target.files?.[0] || null)}
                    className="flex-1"
                  />
                  <Upload className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Vergi dairesinden alınan güncel vergi levhası
                </p>
              </div>

              <div className="p-4 border-2 border-dashed rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Label>Ticaret Sicil Gazetesi</Label>
                  {formData.tradeLicense && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <Input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileChange('tradeLicense', e.target.files?.[0] || null)}
                    className="flex-1"
                  />
                  <Upload className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Firma kuruluş veya son değişiklik gazetesi
                </p>
              </div>

              <div className="p-4 border-2 border-dashed rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Label>İmza Sirküleri</Label>
                  {formData.signatureCircular && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <Input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileChange('signatureCircular', e.target.files?.[0] || null)}
                    className="flex-1"
                  />
                  <Upload className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Yetkili imza sirküleri (opsiyonel)
                </p>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-600 dark:text-blue-400">
                <p className="font-medium mb-1">Güvenlik</p>
                <p>Tüm belgeleriniz 256-bit şifreleme ile güvenli bir şekilde saklanır ve sadece doğrulama amacıyla kullanılır.</p>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg space-y-4">
              <h3 className="font-semibold text-lg">Başvuru Özeti</h3>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Firma Unvanı</p>
                  <p className="font-medium">{formData.companyName}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Vergi No</p>
                  <p className="font-medium">{formData.taxNumber}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Yetkili Kişi</p>
                  <p className="font-medium">{formData.contactName}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">İletişim</p>
                  <p className="font-medium">{formData.contactPhone}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Faaliyet Alanı</p>
                  <p className="font-medium">{formData.activityArea}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Aylık Gönderi</p>
                  <p className="font-medium">{formData.monthlyShipmentVolume} adet</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) => handleInputChange('termsAccepted', checked === true)}
                />
                <div className="space-y-1">
                  <Label htmlFor="terms" className="cursor-pointer text-sm">
                    Hizmet Sözleşmesini okudum ve kabul ediyorum
                  </Label>
                  <p className="text-xs text-gray-500">
                    <Link href="/terms" className="underline">Hizmet sözleşmesini</Link> okumak için tıklayın.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="kvkk"
                  checked={formData.kvkkAccepted}
                  onCheckedChange={(checked) => handleInputChange('kvkkAccepted', checked === true)}
                />
                <div className="space-y-1">
                  <Label htmlFor="kvkk" className="cursor-pointer text-sm">
                    KVKK Aydınlatma Metnini okudum ve kabul ediyorum
                  </Label>
                  <p className="text-xs text-gray-500">
                    <Link href="/kvkk" className="underline">KVKK metnini</Link> okumak için tıklayın.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="corporate"
                  checked={formData.corporateAgreement}
                  onCheckedChange={(checked) => handleInputChange('corporateAgreement', checked === true)}
                />
                <div className="space-y-1">
                  <Label htmlFor="corporate" className="cursor-pointer text-sm">
                    Kurumsal Müşteri Sözleşmesini okudum ve kabul ediyorum
                  </Label>
                  <p className="text-xs text-gray-500">
                    <Link href="/corporate-agreement" className="underline">Kurumsal sözleşmeyi</Link> okumak için tıklayın.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
              <h4 className="font-medium mb-2 text-green-800 dark:text-green-200">
                Başvuru Sonrası Süreç
              </h4>
              <ul className="text-sm space-y-1 text-green-700 dark:text-green-300">
                <li>• Başvurunuz 1-2 iş günü içinde değerlendirilecektir</li>
                <li>• Onay durumu e-posta ile bildirilecektir</li>
                <li>• Kurumsal müşteri temsilciniz atanacaktır</li>
                <li>• Size özel fiyat teklifi hazırlanacaktır</li>
                <li>• API entegrasyonu için teknik destek sağlanacaktır</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const progressPercentage = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-black">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Ana Sayfa</span>
          </Link>
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span className="font-semibold">Kurumsal Başvuru</span>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-900 border-b">
        <div className="container mx-auto px-4 py-4">
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between mt-4">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center ${
                    step.id <= currentStep ? "text-primary" : "text-gray-400"
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    step.id <= currentStep ? "bg-primary/10" : "bg-gray-100"
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs mt-1 hidden lg:block">{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>
              Adım {currentStep} / {steps.length}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </CardContent>

          <div className="px-6 pb-6 flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Önceki
            </Button>
            
            {currentStep < steps.length ? (
              <Button onClick={handleNext}>
                Sonraki
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    Başvuruyu Gönder
                    <CheckCircle className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}