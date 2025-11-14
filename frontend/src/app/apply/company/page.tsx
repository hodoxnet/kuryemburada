"use client";

import { useState, useEffect } from "react";
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
  MapPin,
  User,
  Shield
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api-client";
import { getAllProvinces, getDistrictsByProvinceId, Province, District } from "@/lib/api/geography";

interface CompanyFormData {
  // Adım 1: Firma & Login
  companyName: string;
  email: string;
  password: string;
  phone: string;
  taxNumber: string;
  taxOffice: string;
  
  // Adım 2: Adres & Yetkili
  city: string;
  district: string;
  address: string;
  contactName: string;
  contactPhone: string;
  website: string;
  
  // Adım 3: Belgeler & Onay
  taxCertificate: File | null;
  tradeLicense: File | null;
  kvkkAccepted: boolean;
  termsAccepted: boolean;
}

const initialFormData: CompanyFormData = {
  companyName: "",
  email: "",
  password: "",
  phone: "",
  taxNumber: "",
  taxOffice: "",
  city: "",
  district: "",
  address: "",
  contactName: "",
  contactPhone: "",
  website: "",
  taxCertificate: null,
  tradeLicense: null,
  kvkkAccepted: false,
  termsAccepted: false,
};

const steps = [
  { id: 1, title: "Firma & Login Bilgileri", icon: Building2 },
  { id: 2, title: "Adres & Yetkili Kişi", icon: MapPin },
  { id: 3, title: "Belgeler & Onay", icon: FileText },
];

const cities = [
  "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya", 
  "Şanlıurfa", "Gaziantep", "Kocaeli", "Mersin", "Diyarbakır", "Hatay", "Manisa"
];

const districts = {
  "İstanbul": ["Kadıköy", "Beşiktaş", "Şişli", "Üsküdar", "Maltepe", "Ataşehir", "Ümraniye", "Kartal", "Pendik"],
  "Ankara": ["Çankaya", "Keçiören", "Yenimahalle", "Mamak", "Sincan", "Etimesgut", "Altındağ"],
  "İzmir": ["Konak", "Bornova", "Karşıyaka", "Bayraklı", "Buca", "Çiğli", "Gaziemir"],
  // Diğer iller için varsayılan
  default: ["Merkez", "Cumhuriyet", "Fatih", "Yeni"]
};

export default function CompanyApplicationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CompanyFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>("");

  // İlleri yükle
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        setLoadingProvinces(true);
        const data = await getAllProvinces();
        setProvinces(data);
      } catch (error) {
        console.error('İller yüklenirken hata oluştu:', error);
        toast.error('İller yüklenirken hata oluştu');
      } finally {
        setLoadingProvinces(false);
      }
    };

    loadProvinces();
  }, []);

  // İl değiştiğinde ilçeleri yükle
  useEffect(() => {
    const loadDistricts = async () => {
      if (!selectedProvinceId) {
        setDistricts([]);
        return;
      }

      try {
        setLoadingDistricts(true);
        const data = await getDistrictsByProvinceId(selectedProvinceId);
        setDistricts(data);
      } catch (error) {
        console.error('İlçeler yüklenirken hata oluştu:', error);
        toast.error('İlçeler yüklenirken hata oluştu');
      } finally {
        setLoadingDistricts(false);
      }
    };

    loadDistricts();
  }, [selectedProvinceId]);

  const handleInputChange = (field: keyof CompanyFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProvinceChange = (provinceId: string) => {
    const province = provinces.find(p => p.id === provinceId);
    if (province) {
      setSelectedProvinceId(provinceId);
      handleInputChange('city', province.name);
      handleInputChange('district', ''); // İlçeyi sıfırla
    }
  };

  const handleDistrictChange = (districtId: string) => {
    const district = districts.find(d => d.id === districtId);
    if (district) {
      handleInputChange('district', district.name);
    }
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
        if (!formData.companyName || !formData.email || !formData.password || !formData.phone) {
          toast.error("Lütfen zorunlu alanları doldurun");
          return false;
        }
        if (formData.password.length < 6) {
          toast.error("Şifre en az 6 karakter olmalıdır");
          return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          toast.error("Geçerli bir e-posta adresi girin");
          return false;
        }
        // Vergi numarası girilmişse 10 veya 11 haneli olması gerekir
        if (formData.taxNumber && (formData.taxNumber.length !== 10 && formData.taxNumber.length !== 11)) {
          toast.error("Vergi numarası 10 veya 11 haneli olmalıdır");
          return false;
        }
        // Vergi numarası girilmişse vergi dairesi de gerekli
        if (formData.taxNumber && !formData.taxOffice) {
          toast.error("Vergi numarası girdiğiniz için vergi dairesi de gereklidir");
          return false;
        }
        return true;
      
      case 2:
        if (!formData.city || !formData.district || !formData.address || !formData.contactName || !formData.contactPhone) {
          toast.error("Lütfen zorunlu alanları doldurun");
          return false;
        }
        return true;
      
      case 3:
        if (!formData.taxCertificate) {
          toast.error("Lütfen vergi levhası yükleyin");
          return false;
        }
        if (!formData.kvkkAccepted || !formData.termsAccepted) {
          toast.error("Lütfen sözleşmeleri onaylayın");
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

  const uploadDocuments = async (userId: string) => {
    console.log('📁 Belge yükleme başlıyor, userId:', userId);
    console.log('🗂️ Yüklenecek belgeler:', {
      taxCertificate: formData.taxCertificate ? `${formData.taxCertificate.name} (${formData.taxCertificate.size} bytes)` : 'Yok',
      tradeLicense: formData.tradeLicense ? `${formData.tradeLicense.name} (${formData.tradeLicense.size} bytes)` : 'Yok'
    });

    let uploadedCount = 0;
    
    try {
      // Vergi levhası yükle (zorunlu)
      if (formData.taxCertificate) {
        console.log('📄 Vergi levhası yükleniyor...');
        const taxCertFormData = new FormData();
        taxCertFormData.append('file', formData.taxCertificate);
        taxCertFormData.append('type', 'TAX_CERTIFICATE');
        taxCertFormData.append('description', 'Firma vergi levhası');

        const response = await apiClient.post(`/documents/upload-for-user/${userId}`, taxCertFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('✅ Vergi levhası yüklendi:', response.data);
        uploadedCount++;
      }

      // Ticaret sicil gazetesi yükle (opsiyonel)
      if (formData.tradeLicense) {
        console.log('📄 Ticaret sicil gazetesi yükleniyor...');
        const tradeLicenseFormData = new FormData();
        tradeLicenseFormData.append('file', formData.tradeLicense);
        tradeLicenseFormData.append('type', 'TRADE_LICENSE');
        tradeLicenseFormData.append('description', 'Ticaret sicil gazetesi');

        const response = await apiClient.post(`/documents/upload-for-user/${userId}`, tradeLicenseFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('✅ Ticaret sicil gazetesi yüklendi:', response.data);
        uploadedCount++;
      }

      console.log(`🎉 Belge yükleme tamamlandı: ${uploadedCount} belge yüklendi`);
      
      if (uploadedCount > 0) {
        toast.success(`${uploadedCount} belge başarıyla yüklendi`);
      }
    } catch (error: any) {
      console.error('❌ Belge yükleme hatası:', error);
      console.error('Hata detayları:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      // Belge hatası başvuruyu engellemez, sadece uyarırız
      const errorMessage = error.response?.data?.message || 'Belgeler yüklenemedi, daha sonra admin panelinden yükleyebilirsiniz.';
      toast.warning(errorMessage);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    
    try {
      // Backend DTO formatına uygun JSON oluştur
      const submitData = {
        email: formData.email,
        password: formData.password,
        companyName: formData.companyName,
        phone: formData.phone,
        address: {
          city: formData.city,
          district: formData.district,
          street: formData.address,
          postalCode: '34000' // Varsayılan
        },
        contactPerson: {
          fullName: formData.contactName,
          phone: formData.contactPhone,
          email: formData.email // Varsayılan olarak aynı email
        }
      };

      // Opsiyonel alanları ekle
      if (formData.taxNumber) {
        submitData.taxNumber = formData.taxNumber;
      }
      if (formData.taxOffice) {
        submitData.taxOffice = formData.taxOffice;
      }
      if (formData.website) {
        submitData.website = formData.website;
      }
      
      // API çağrısı
      console.log('🚀 Company register API çağrısı yapılıyor...');
      const response = await apiClient.post('/auth/company/register', submitData);
      console.log('✅ Company register başarılı:', response.data);
      
      // Başvuru başarılı olduysa belgeleri yükle
      if (response.data?.user?.id) {
        console.log('👤 User ID bulundu, belge yükleme işlemi başlatılıyor:', response.data.user.id);
        await uploadDocuments(response.data.user.id);
      } else {
        console.warn('⚠️ User ID bulunamadı, belgeler yüklenemedi:', response.data);
      }
      
      toast.success("Başvurunuz başarıyla alındı! En kısa sürede size dönüş yapacağız.");
      router.push("/apply/success");
      
    } catch (error: any) {
      console.error('Başvuru hatası:', error);
      
      // Hata mesajlarını kullanıcı dostu hale getir
      let errorMessage = "Başvuru sırasında bir hata oluştu. Lütfen tekrar deneyin.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 409) {
        errorMessage = "Bu bilgilerle daha önce başvuru yapılmış. Lütfen farklı bilgiler kullanın.";
      } else if (error.response?.status === 400) {
        errorMessage = "Girilen bilgilerde hata var. Lütfen kontrol edin.";
      } else if (error.response?.status === 500) {
        errorMessage = "Sistemsel bir hata oluştu. Lütfen daha sonra tekrar deneyin.";
      }
      
      toast.error(errorMessage);
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
                  <Label htmlFor="email">E-posta (Giriş için) *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="info@firma.com"
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

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Firma Telefonu *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0212 XXX XX XX"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="taxNumber">Vergi Numarası</Label>
                    <Input
                      id="taxNumber"
                      type="text"
                      maxLength={11}
                      placeholder="1234567890"
                      value={formData.taxNumber}
                      onChange={(e) => handleInputChange('taxNumber', e.target.value.replace(/\D/g, ''))}
                    />
                    <p className="text-xs text-gray-500">Opsiyonel - 10 veya 11 haneli</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="taxOffice">
                      Vergi Dairesi {formData.taxNumber && "*"}
                    </Label>
                    <Input
                      id="taxOffice"
                      type="text"
                      placeholder="Kadıköy Vergi Dairesi"
                      value={formData.taxOffice}
                      onChange={(e) => handleInputChange('taxOffice', e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      {formData.taxNumber 
                        ? "Vergi numarası girildiği için zorunlu" 
                        : "Opsiyonel - vergi dairesi adı"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-600 dark:text-blue-400">
                <p className="font-medium mb-1">Önemli Bilgi</p>
                <p>E-posta adresiniz sisteme giriş için kullanılacaktır. Doğru bir e-posta adresi girdiğinizden emin olun.</p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">Adres Bilgileri</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">İl *</Label>
                  <Select
                    value={selectedProvinceId}
                    onValueChange={handleProvinceChange}
                    disabled={loadingProvinces}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingProvinces ? "Yükleniyor..." : "İl seçin"} />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((province) => (
                        <SelectItem key={province.id} value={province.id}>
                          {province.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">İlçe *</Label>
                  <Select
                    value={districts.find(d => d.name === formData.district)?.id || ""}
                    onValueChange={handleDistrictChange}
                    disabled={!selectedProvinceId || loadingDistricts}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !selectedProvinceId
                          ? "Önce il seçin"
                          : loadingDistricts
                          ? "Yükleniyor..."
                          : "İlçe seçin"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((district) => (
                        <SelectItem key={district.id} value={district.id}>
                          {district.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Açık Adres *</Label>
                <Textarea
                  id="address"
                  placeholder="Mahalle, sokak, bina no, kat, daire vb. detaylı adres bilgisi"
                  rows={3}
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Yetkili Kişi</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Yetkili Kişi Adı *</Label>
                  <Input
                    id="contactName"
                    type="text"
                    placeholder="Mehmet Demir"
                    value={formData.contactName}
                    onChange={(e) => handleInputChange('contactName', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Yetkili Telefonu *</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    placeholder="5XX XXX XX XX"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
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
                <p className="text-xs text-gray-500">Opsiyonel - varsa firma web siteniz</p>
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

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">Belgeler</h4>
              
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
                  Vergi dairesinden alınan güncel vergi levhası (PDF veya görsel)
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
                  Opsiyonel - Firma kuruluş veya son değişiklik gazetesi
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Sözleşmeler & Onaylar</h4>
              
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="kvkk"
                  checked={formData.kvkkAccepted}
                  onCheckedChange={(checked) => handleInputChange('kvkkAccepted', checked === true)}
                />
                <div className="space-y-1">
                  <Label htmlFor="kvkk" className="cursor-pointer text-sm">
                    KVKK Aydınlatma Metnini okudum ve kabul ediyorum *
                  </Label>
                  <p className="text-xs text-gray-500">
                    <Link href="/kvkk" className="underline text-blue-600">KVKK metnini</Link> okumak için tıklayın.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) => handleInputChange('termsAccepted', checked === true)}
                />
                <div className="space-y-1">
                  <Label htmlFor="terms" className="cursor-pointer text-sm">
                    Hizmet Sözleşmesini okudum ve kabul ediyorum *
                  </Label>
                  <p className="text-xs text-gray-500">
                    <Link href="/terms" className="underline text-blue-600">Hizmet sözleşmesini</Link> okumak için tıklayın.
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
                <li>• Hesabınız aktifleştirilecek ve sisteme giriş yapabileceksiniz</li>
                <li>• Gerekirse ek belgeler talep edilebilir</li>
              </ul>
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
            <span className="font-semibold">Firma Başvurusu</span>
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
                  <span className="text-xs mt-1 text-center max-w-20">{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
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