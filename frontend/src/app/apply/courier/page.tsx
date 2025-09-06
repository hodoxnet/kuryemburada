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
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Car, 
  FileText, 
  Upload, 
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CreditCard,
  Shield,
  MapPin,
  Users
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { applicationService, CourierApplicationData } from "@/lib/api/application.service";

interface FormData {
  // Kişisel Bilgiler
  tcNumber: string;
  fullName: string;
  email: string;
  password: string;
  phone: string;
  birthDate: string;
  
  // Adres Bilgileri
  city: string;
  district: string;
  address: string;
  
  // Araç Bilgileri
  hasVehicle: boolean;
  vehiclePlate: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: string;
  
  // Ehliyet Bilgileri
  licenseClass: string;
  licenseNumber: string;
  licenseIssueDate: string;
  licenseExpiryDate: string;
  
  // Banka Bilgileri
  bankName: string;
  iban: string;
  
  // Acil Durum
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelation: string;
  
  // Belgeler
  identityFront: File | null;
  identityBack: File | null;
  driverLicense: File | null;
  vehicleRegistration: File | null;
  criminalRecord: File | null;
  
  // Sözleşmeler
  termsAccepted: boolean;
  kvkkAccepted: boolean;
}

const initialFormData: FormData = {
  tcNumber: "",
  fullName: "",
  email: "",
  password: "",
  phone: "",
  birthDate: "",
  city: "",
  district: "",
  address: "",
  hasVehicle: true,
  vehiclePlate: "",
  vehicleBrand: "",
  vehicleModel: "",
  vehicleYear: "",
  licenseClass: "",
  licenseNumber: "",
  licenseIssueDate: "",
  licenseExpiryDate: "",
  bankName: "",
  iban: "",
  emergencyName: "",
  emergencyPhone: "",
  emergencyRelation: "",
  identityFront: null,
  identityBack: null,
  driverLicense: null,
  vehicleRegistration: null,
  criminalRecord: null,
  termsAccepted: false,
  kvkkAccepted: false,
};

const steps = [
  { id: 1, title: "Kişisel Bilgiler", icon: User },
  { id: 2, title: "Adres Bilgileri", icon: MapPin },
  { id: 3, title: "Araç ve Ehliyet", icon: Car },
  { id: 4, title: "Banka Bilgileri", icon: CreditCard },
  { id: 5, title: "Belgeler", icon: FileText },
  { id: 6, title: "Onay", icon: CheckCircle },
];

export default function CourierApplicationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (field: keyof FormData, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.tcNumber || formData.tcNumber.length !== 11) {
          toast.error("TC Kimlik numarası 11 haneli olmalıdır");
          return false;
        }
        if (!formData.fullName || !formData.email || !formData.password || !formData.phone || !formData.birthDate) {
          toast.error("Lütfen tüm alanları doldurun");
          return false;
        }
        if (formData.password.length < 6) {
          toast.error("Şifre en az 6 karakter olmalıdır");
          return false;
        }
        return true;
      
      case 2:
        if (!formData.city || !formData.district || !formData.address) {
          toast.error("Lütfen tüm adres bilgilerini doldurun");
          return false;
        }
        return true;
      
      case 3:
        if (formData.hasVehicle) {
          if (!formData.vehiclePlate || !formData.vehicleBrand || !formData.vehicleModel) {
            toast.error("Lütfen araç bilgilerini doldurun");
            return false;
          }
        }
        if (!formData.licenseClass || !formData.licenseNumber) {
          toast.error("Lütfen ehliyet bilgilerini doldurun");
          return false;
        }
        return true;
      
      case 4:
        if (!formData.bankName || !formData.iban) {
          toast.error("Lütfen banka bilgilerini doldurun");
          return false;
        }
        if (!formData.emergencyName || !formData.emergencyPhone) {
          toast.error("Lütfen acil durum kişisi bilgilerini doldurun");
          return false;
        }
        return true;
      
      case 5:
        if (!formData.identityFront || !formData.identityBack) {
          toast.error("Lütfen kimlik fotoğraflarını yükleyin");
          return false;
        }
        if (!formData.driverLicense) {
          toast.error("Lütfen ehliyet fotoğrafını yükleyin");
          return false;
        }
        return true;
      
      case 6:
        if (!formData.termsAccepted || !formData.kvkkAccepted) {
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

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    
    try {
      // API için veri hazırla
      const applicationData: CourierApplicationData = {
        email: formData.email,
        password: formData.password,
        tcNumber: formData.tcNumber,
        fullName: formData.fullName,
        phone: formData.phone,
        birthDate: formData.birthDate || undefined,
        address: {
          city: formData.city,
          district: formData.district,
          neighborhood: formData.address.split(',')[0] || 'Merkez',
          street: formData.address.split(',')[1] || formData.address,
          detail: formData.address,
        },
        hasVehicle: formData.hasVehicle,
      };

      // Opsiyonel alanları ekle
      if (formData.licenseClass && formData.licenseNumber) {
        applicationData.licenseInfo = {
          class: formData.licenseClass,
          number: formData.licenseNumber,
          issueDate: formData.licenseIssueDate || '',
          expiryDate: formData.licenseExpiryDate || '',
        };
      }

      if (formData.hasVehicle && formData.vehiclePlate) {
        applicationData.vehicleInfo = {
          plate: formData.vehiclePlate,
          brand: formData.vehicleBrand,
          model: formData.vehicleModel,
          year: formData.vehicleYear,
        };
      }

      if (formData.bankName && formData.iban) {
        applicationData.bankInfo = {
          bankName: formData.bankName,
          iban: formData.iban,
          accountHolder: formData.fullName,
        };
      }

      if (formData.emergencyName && formData.emergencyPhone) {
        applicationData.emergencyContact = {
          name: formData.emergencyName,
          phone: formData.emergencyPhone,
          relationship: formData.emergencyRelation,
        };
      }

      // Belgeleri hazırla
      const files: { [key: string]: File } = {};
      if (formData.identityFront) files.identityFront = formData.identityFront;
      if (formData.identityBack) files.identityBack = formData.identityBack;
      if (formData.driverLicense) files.driverLicense = formData.driverLicense;
      if (formData.vehicleRegistration) files.vehicleRegistration = formData.vehicleRegistration;
      if (formData.criminalRecord) files.criminalRecord = formData.criminalRecord;
      
      // Başvuruyu ve belgeleri gönder
      const response = await applicationService.submitCourierApplication(applicationData, files);
      
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
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tcNumber">TC Kimlik No *</Label>
                <Input
                  id="tcNumber"
                  type="text"
                  maxLength={11}
                  placeholder="12345678901"
                  value={formData.tcNumber}
                  onChange={(e) => handleInputChange('tcNumber', e.target.value.replace(/\D/g, ''))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fullName">Ad Soyad *</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Ahmet Yılmaz"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-posta *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@email.com"
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

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="5XX XXX XX XX"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="birthDate">Doğum Tarihi *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                />
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Kurye olabilmek için 18 yaşından büyük olmanız gerekmektedir.
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
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
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Açık Adres *</Label>
              <Textarea
                id="address"
                placeholder="Mahalle, sokak, bina no vb. detaylı adres bilgisi"
                rows={4}
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>

            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
              <p className="text-sm text-green-600 dark:text-green-400">
                Adres bilgileriniz sadece gerekli evrak gönderimi için kullanılacaktır.
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="hasVehicle"
                checked={formData.hasVehicle}
                onCheckedChange={(checked) => handleInputChange('hasVehicle', checked)}
              />
              <Label htmlFor="hasVehicle" className="cursor-pointer">
                Kendime ait aracım var
              </Label>
            </div>

            {formData.hasVehicle && (
              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-medium">Araç Bilgileri</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehiclePlate">Plaka *</Label>
                    <Input
                      id="vehiclePlate"
                      type="text"
                      placeholder="34 ABC 123"
                      value={formData.vehiclePlate}
                      onChange={(e) => handleInputChange('vehiclePlate', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vehicleBrand">Marka *</Label>
                    <Input
                      id="vehicleBrand"
                      type="text"
                      placeholder="Honda"
                      value={formData.vehicleBrand}
                      onChange={(e) => handleInputChange('vehicleBrand', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vehicleModel">Model *</Label>
                    <Input
                      id="vehicleModel"
                      type="text"
                      placeholder="PCX 125"
                      value={formData.vehicleModel}
                      onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vehicleYear">Yıl</Label>
                    <Input
                      id="vehicleYear"
                      type="text"
                      placeholder="2020"
                      value={formData.vehicleYear}
                      onChange={(e) => handleInputChange('vehicleYear', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-medium">Ehliyet Bilgileri</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="licenseClass">Ehliyet Sınıfı *</Label>
                  <Select value={formData.licenseClass} onValueChange={(value) => handleInputChange('licenseClass', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A1">A1</SelectItem>
                      <SelectItem value="A2">A2</SelectItem>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">Ehliyet No *</Label>
                  <Input
                    id="licenseNumber"
                    type="text"
                    placeholder="Ehliyet numarası"
                    value={formData.licenseNumber}
                    onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="licenseIssueDate">Veriliş Tarihi</Label>
                  <Input
                    id="licenseIssueDate"
                    type="date"
                    value={formData.licenseIssueDate}
                    onChange={(e) => handleInputChange('licenseIssueDate', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="licenseExpiryDate">Geçerlilik Tarihi</Label>
                  <Input
                    id="licenseExpiryDate"
                    type="date"
                    value={formData.licenseExpiryDate}
                    onChange={(e) => handleInputChange('licenseExpiryDate', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-medium">Banka Bilgileri</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Kazançlarınız bu hesaba yatırılacaktır.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
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

            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-medium">Acil Durum Kişisi</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Acil durumlarda ulaşılacak kişi bilgileri.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyName">Ad Soyad *</Label>
                  <Input
                    id="emergencyName"
                    type="text"
                    placeholder="Acil durum kişisi"
                    value={formData.emergencyName}
                    onChange={(e) => handleInputChange('emergencyName', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Telefon *</Label>
                  <Input
                    id="emergencyPhone"
                    type="tel"
                    placeholder="5XX XXX XX XX"
                    value={formData.emergencyPhone}
                    onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emergencyRelation">Yakınlık Derecesi</Label>
                  <Select value={formData.emergencyRelation} onValueChange={(value) => handleInputChange('emergencyRelation', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anne">Anne</SelectItem>
                      <SelectItem value="baba">Baba</SelectItem>
                      <SelectItem value="es">Eş</SelectItem>
                      <SelectItem value="kardes">Kardeş</SelectItem>
                      <SelectItem value="arkadas">Arkadaş</SelectItem>
                      <SelectItem value="diger">Diğer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="grid gap-4">
              <div className="p-4 border-2 border-dashed rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Label>Kimlik Ön Yüz *</Label>
                  {formData.identityFront && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('identityFront', e.target.files?.[0] || null)}
                    className="flex-1"
                  />
                  <Upload className="h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="p-4 border-2 border-dashed rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Label>Kimlik Arka Yüz *</Label>
                  {formData.identityBack && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('identityBack', e.target.files?.[0] || null)}
                    className="flex-1"
                  />
                  <Upload className="h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="p-4 border-2 border-dashed rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Label>Ehliyet *</Label>
                  {formData.driverLicense && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('driverLicense', e.target.files?.[0] || null)}
                    className="flex-1"
                  />
                  <Upload className="h-5 w-5 text-gray-400" />
                </div>
              </div>

              {formData.hasVehicle && (
                <div className="p-4 border-2 border-dashed rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Araç Ruhsatı</Label>
                    {formData.vehicleRegistration && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('vehicleRegistration', e.target.files?.[0] || null)}
                      className="flex-1"
                    />
                    <Upload className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              )}

              <div className="p-4 border-2 border-dashed rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Label>Adli Sicil Belgesi (Opsiyonel)</Label>
                  {formData.criminalRecord && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <Input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileChange('criminalRecord', e.target.files?.[0] || null)}
                    className="flex-1"
                  />
                  <Upload className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  E-devlet üzerinden alabilirsiniz
                </p>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg flex items-start space-x-3">
              <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Belgeleriniz güvenli bir şekilde saklanacak ve sadece doğrulama amacıyla kullanılacaktır.
              </p>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg space-y-4">
              <h3 className="font-semibold text-lg">Başvuru Özeti</h3>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Ad Soyad</p>
                  <p className="font-medium">{formData.fullName}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">TC Kimlik No</p>
                  <p className="font-medium">{formData.tcNumber}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">E-posta</p>
                  <p className="font-medium">{formData.email}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Telefon</p>
                  <p className="font-medium">{formData.phone}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Şehir</p>
                  <p className="font-medium">{formData.city} / {formData.district}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Araç Durumu</p>
                  <p className="font-medium">{formData.hasVehicle ? "Var" : "Yok"}</p>
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
                    Kullanım Koşullarını okudum ve kabul ediyorum
                  </Label>
                  <p className="text-xs text-gray-500">
                    <Link href="/terms" className="underline">Kullanım koşullarını</Link> okumak için tıklayın.
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
            </div>

            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
              <h4 className="font-medium mb-2 text-green-800 dark:text-green-200">
                Başvuru Sonrası Süreç
              </h4>
              <ul className="text-sm space-y-1 text-green-700 dark:text-green-300">
                <li>• Başvurunuz 2-3 iş günü içinde değerlendirilecektir</li>
                <li>• Onay durumu SMS ve e-posta ile bildirilecektir</li>
                <li>• Onaylandıktan sonra eğitim sürecine davet edileceksiniz</li>
                <li>• Eğitimi tamamladıktan sonra teslimat yapmaya başlayabilirsiniz</li>
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
          <Link 
            href={typeof window !== 'undefined' && (window as any).isWebView ? "/courier/login" : "/"} 
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">
              {typeof window !== 'undefined' && (window as any).isWebView ? "Giriş" : "Ana Sayfa"}
            </span>
          </Link>
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-primary" />
            <span className="font-semibold">Kurye Başvurusu</span>
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
                  <span className="text-xs mt-1 hidden md:block">{step.title}</span>
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