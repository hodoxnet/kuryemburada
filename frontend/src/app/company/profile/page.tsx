'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  User,
  FileText,
  Info,
  Lock,
  PlugZap,
  KeyRound,
  ShieldCheck,
  Power,
} from 'lucide-react';
import companyAPI, {
  CompanyProfile,
  UpdateCompanyData,
  UpsertYemeksepetiVendorInput,
  YemeksepetiVendorSettings,
} from '@/lib/api/company';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { authService } from '@/services/auth.service';
import { Switch } from '@/components/ui/switch';

const addressSchema = z.object({
  city: z.string().min(1, 'Şehir zorunludur'),
  district: z.string().min(1, 'İlçe zorunludur'),
  neighborhood: z.string().min(1, 'Mahalle zorunludur'),
  street: z.string().min(1, 'Sokak/Cadde zorunludur'),
  detail: z.string().min(1, 'Detaylı adres zorunludur'),
});

const bankInfoSchema = z.object({
  bankName: z.string().min(1, 'Banka adı zorunludur'),
  iban: z.string().min(1, 'IBAN zorunludur'),
  accountHolder: z.string().min(1, 'Hesap sahibi zorunludur'),
});

const contactPersonSchema = z.object({
  name: z.string().min(1, 'İsim zorunludur'),
  phone: z.string().min(1, 'Telefon zorunludur'),
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  title: z.string().min(1, 'Ünvan zorunludur'),
});

const companyUpdateSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  kepAddress: z.string().optional(),
  activityArea: z.string().optional(),
  taxOffice: z.string().optional(),
  defaultPackageType: z.string().optional(),
  address: addressSchema.optional(),
  bankInfo: bankInfoSchema.optional(),
  contactPerson: contactPersonSchema.optional(),
});

const passwordChangeSchema = z.object({
  oldPassword: z.string().min(6, 'Mevcut şifre en az 6 karakter olmalıdır'),
  newPassword: z.string().min(6, 'Yeni şifre en az 6 karakter olmalıdır'),
  confirmPassword: z.string().min(6, 'Şifre tekrarı en az 6 karakter olmalıdır'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

const yemeksepetiSchema = z.object({
  remoteId: z.string().min(1, 'remoteId zorunludur'),
  posVendorId: z.string().min(1, 'Pos Vendor ID zorunludur'),
  chainCode: z.string().min(1, 'Chain code zorunludur'),
  brandCode: z.string().optional(),
  platformRestaurantId: z.string().optional(),
  pickupAddress: z.object({
    lat: z.coerce.number({ invalid_type_error: 'Enlem gerekli' }),
    lng: z.coerce.number({ invalid_type_error: 'Boylam gerekli' }),
    address: z.string().optional(),
    detail: z.string().optional(),
  }),
  isActive: z.boolean().optional(),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  inboundToken: z.string().optional(),
  tokenUrl: z.string().optional(),
  baseUrl: z.string().optional(),
});

type CompanyUpdateForm = z.infer<typeof companyUpdateSchema>;
type PasswordChangeForm = z.infer<typeof passwordChangeSchema>;
type YemeksepetiForm = z.infer<typeof yemeksepetiSchema>;

export default function CompanyProfilePage() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [yemeksepetiSettings, setYemeksepetiSettings] = useState<YemeksepetiVendorSettings | null>(null);
  const [yemeksepetiLoading, setYemeksepetiLoading] = useState(false);
  const [yemeksepetiSaving, setYemeksepetiSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CompanyUpdateForm>({
    resolver: zodResolver(companyUpdateSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordChangeForm>({
    resolver: zodResolver(passwordChangeSchema),
  });

  const {
    register: registerYemeksepeti,
    handleSubmit: handleYemeksepetiSubmit,
    formState: { errors: yemeksepetiErrors },
    reset: resetYemeksepeti,
    watch: watchYemeksepeti,
    setValue: setYemeksepetiValue,
  } = useForm<YemeksepetiForm>({
    resolver: zodResolver(yemeksepetiSchema),
    defaultValues: {
      isActive: true,
    },
  });

  const toFormNumber = (value: number | null | undefined) => (value ?? '') as unknown as number;

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await companyAPI.getProfile();
      setProfile(data);
      
      // Form verilerini doldur
      reset({
        name: data.name,
        phone: data.phone,
        kepAddress: data.kepAddress || '',
        activityArea: data.activityArea || '',
        taxOffice: data.taxOffice || '',
        defaultPackageType: data.defaultPackageType || '',
        address: data.address,
        bankInfo: data.bankInfo || undefined,
        contactPerson: data.contactPerson || undefined,
      });
    } catch (error) {
      console.error('Profil yüklenirken hata:', error);
      toast.error('Profil bilgileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchYemeksepeti = async () => {
    try {
      setYemeksepetiLoading(true);
      const data = await companyAPI.getYemeksepetiSettings();
      setYemeksepetiSettings(data);

      if (data) {
        resetYemeksepeti({
          remoteId: data.remoteId,
          posVendorId: data.posVendorId,
          chainCode: data.chainCode || '',
          brandCode: data.brandCode || '',
          platformRestaurantId: data.platformRestaurantId || '',
          pickupAddress: {
            lat: toFormNumber(data.pickupAddress?.lat),
            lng: toFormNumber(data.pickupAddress?.lng),
            address: data.pickupAddress?.address || '',
            detail: data.pickupAddress?.detail || '',
          },
          isActive: data.isActive,
          clientId: data.clientId || '',
          clientSecret: data.clientSecret || '',
          inboundToken: data.inboundToken || '',
          tokenUrl: data.tokenUrl || '',
          baseUrl: data.baseUrl || '',
        });
      } else {
        resetYemeksepeti({
          remoteId: '',
          posVendorId: '',
          chainCode: '',
          brandCode: '',
          platformRestaurantId: '',
          pickupAddress: {
            lat: '' as unknown as number,
            lng: '' as unknown as number,
            address: '',
            detail: '',
          },
          isActive: true,
          clientId: '',
          clientSecret: '',
          inboundToken: '',
          tokenUrl: '',
          baseUrl: '',
        });
      }
    } catch (error) {
      console.error('Yemeksepeti bilgileri alınamadı:', error);
      toast.error('Yemeksepeti bilgileri yüklenemedi');
    } finally {
      setYemeksepetiLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchYemeksepeti();
  }, []);

  const onSubmit = async (data: CompanyUpdateForm) => {
    try {
      setUpdating(true);
      const updatedProfile = await companyAPI.updateProfile(data as UpdateCompanyData);
      setProfile(updatedProfile);
      toast.success('Profil başarıyla güncellendi');
    } catch (error) {
      console.error('Profil güncellenirken hata:', error);
      toast.error('Profil güncellenemedi');
    } finally {
      setUpdating(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordChangeForm) => {
    try {
      setChangingPassword(true);
      await authService.changePassword(data.oldPassword, data.newPassword);
      toast.success('Şifreniz başarıyla değiştirildi');
      resetPassword();
    } catch (error: any) {
      console.error('Şifre değiştirilirken hata:', error);
      const errorMessage = error?.response?.data?.message || 'Şifre değiştirilemedi';
      toast.error(errorMessage);
    } finally {
      setChangingPassword(false);
    }
  };

  const onYemeksepetiSubmit = async (data: YemeksepetiForm) => {
    try {
      setYemeksepetiSaving(true);
      const saved = await companyAPI.upsertYemeksepetiSettings({
        ...data,
        isActive: data.isActive ?? true,
      } as UpsertYemeksepetiVendorInput);
      setYemeksepetiSettings(saved);
      toast.success('Yemeksepeti entegrasyon bilgileri kaydedildi');
    } catch (error: any) {
      console.error('Yemeksepeti bilgileri kaydedilirken hata:', error);
      const errorMessage = error?.response?.data?.message || 'Yemeksepeti bilgileri kaydedilemedi';
      toast.error(errorMessage);
    } finally {
      setYemeksepetiSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'Beklemede', variant: 'secondary' as const },
      APPROVED: { label: 'Onaylı', variant: 'default' as const },
      REJECTED: { label: 'Reddedildi', variant: 'destructive' as const },
      ACTIVE: { label: 'Aktif', variant: 'default' as const },
      INACTIVE: { label: 'Pasif', variant: 'secondary' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: 'secondary' as const,
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getDocumentTypeLabel = (type: string) => {
    const documentLabels: Record<string, string> = {
      TRADE_LICENSE: 'Ticaret Sicil Gazetesi',
      TAX_CERTIFICATE: 'Vergi Levhası',
      KEP_ADDRESS: 'KEP Adresi Belgesi',
      IDENTITY_CARD: 'Kimlik Kartı',
      DRIVER_LICENSE: 'Ehliyet',
      VEHICLE_REGISTRATION: 'Araç Ruhsatı',
      INSURANCE: 'Sigorta Poliçesi',
      ADDRESS_PROOF: 'İkametgah Belgesi',
      CRIMINAL_RECORD: 'Adli Sicil Kaydı',
      HEALTH_REPORT: 'Sağlık Raporu',
      TAX_PLATE: 'Vergi Levhası',
      OTHER: 'Diğer',
    };

    return documentLabels[type] || type;
  };

  const handleProfileFormSubmit =
    activeTab === 'yemeksepeti'
      ? (event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
        }
      : handleSubmit(onSubmit);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <Alert>
        <AlertDescription>Profil bilgileri yüklenemedi.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Firma Bilgileri</h1>
          <p className="text-muted-foreground">
            Firma profilinizi görüntüleyin ve güncelleyin
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(profile.status)}
        </div>
      </div>

      {profile.rejectionReason && (
        <Alert variant="destructive">
          <AlertDescription>
            <strong>Red Nedeni:</strong> {profile.rejectionReason}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleProfileFormSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general">Genel Bilgiler</TabsTrigger>
            <TabsTrigger value="address">Adres Bilgileri</TabsTrigger>
            <TabsTrigger value="bank">Banka Bilgileri</TabsTrigger>
            <TabsTrigger value="contact">İletişim Kişisi</TabsTrigger>
            <TabsTrigger value="security">Güvenlik</TabsTrigger>
            <TabsTrigger value="yemeksepeti">Yemeksepeti</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Genel Bilgiler
                </CardTitle>
                <CardDescription>
                  Firma genel bilgilerinizi güncelleyebilirsiniz
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Firma Adı</Label>
                    <Input
                      id="name"
                      {...register('name')}
                      placeholder="Firma adını giriniz"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      {...register('phone')}
                      placeholder="Telefon numarası"
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxOffice">Vergi Dairesi</Label>
                    <Input
                      id="taxOffice"
                      {...register('taxOffice')}
                      placeholder="Vergi dairesi"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxNumber">Vergi Numarası</Label>
                    <Input
                      id="taxNumber"
                      value={profile.taxNumber || '-'}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="kepAddress">KEP Adresi</Label>
                    <Input
                      id="kepAddress"
                      {...register('kepAddress')}
                      placeholder="KEP adresi"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tradeLicenseNo">Ticaret Sicil No</Label>
                    <Input
                      id="tradeLicenseNo"
                      value={profile.tradeLicenseNo || '-'}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="activityArea">Faaliyet Alanı</Label>
                    <Textarea
                      id="activityArea"
                      {...register('activityArea')}
                      placeholder="Faaliyet alanınızı belirtiniz"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultPackageType">Varsayılan Paket Tipi</Label>
                    <Select
                      value={watch('defaultPackageType') || ''}
                      onValueChange={(value) => setValue('defaultPackageType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DOCUMENT">Döküman</SelectItem>
                        <SelectItem value="PACKAGE">Paket</SelectItem>
                        <SelectItem value="FOOD">Yemek</SelectItem>
                        <SelectItem value="OTHER">Diğer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="address" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Adres Bilgileri
                </CardTitle>
                <CardDescription>
                  Firma adres bilgilerinizi güncelleyebilirsiniz
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address.city">Şehir</Label>
                    <Input
                      id="address.city"
                      {...register('address.city')}
                      placeholder="Şehir"
                    />
                    {errors.address?.city && (
                      <p className="text-sm text-red-500">{errors.address.city.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address.district">İlçe</Label>
                    <Input
                      id="address.district"
                      {...register('address.district')}
                      placeholder="İlçe"
                    />
                    {errors.address?.district && (
                      <p className="text-sm text-red-500">{errors.address.district.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address.neighborhood">Mahalle</Label>
                    <Input
                      id="address.neighborhood"
                      {...register('address.neighborhood')}
                      placeholder="Mahalle"
                    />
                    {errors.address?.neighborhood && (
                      <p className="text-sm text-red-500">{errors.address.neighborhood.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address.street">Sokak/Cadde</Label>
                    <Input
                      id="address.street"
                      {...register('address.street')}
                      placeholder="Sokak/Cadde"
                    />
                    {errors.address?.street && (
                      <p className="text-sm text-red-500">{errors.address.street.message}</p>
                    )}
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="address.detail">Detaylı Adres</Label>
                    <Textarea
                      id="address.detail"
                      {...register('address.detail')}
                      placeholder="Detaylı adres bilgisi"
                      rows={3}
                    />
                    {errors.address?.detail && (
                      <p className="text-sm text-red-500">{errors.address.detail.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bank" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Banka Bilgileri
                </CardTitle>
                <CardDescription>
                  Ödeme alacağınız banka bilgilerinizi güncelleyebilirsiniz
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankInfo.bankName">Banka Adı</Label>
                    <Input
                      id="bankInfo.bankName"
                      {...register('bankInfo.bankName')}
                      placeholder="Banka adı"
                    />
                    {errors.bankInfo?.bankName && (
                      <p className="text-sm text-red-500">{errors.bankInfo.bankName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankInfo.accountHolder">Hesap Sahibi</Label>
                    <Input
                      id="bankInfo.accountHolder"
                      {...register('bankInfo.accountHolder')}
                      placeholder="Hesap sahibi adı"
                    />
                    {errors.bankInfo?.accountHolder && (
                      <p className="text-sm text-red-500">{errors.bankInfo.accountHolder.message}</p>
                    )}
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="bankInfo.iban">IBAN</Label>
                    <Input
                      id="bankInfo.iban"
                      {...register('bankInfo.iban')}
                      placeholder="TR00 0000 0000 0000 0000 0000 00"
                    />
                    {errors.bankInfo?.iban && (
                      <p className="text-sm text-red-500">{errors.bankInfo.iban.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  İletişim Kişisi
                </CardTitle>
                <CardDescription>
                  Firma iletişim kişisi bilgilerini güncelleyebilirsiniz
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson.name">Ad Soyad</Label>
                    <Input
                      id="contactPerson.name"
                      {...register('contactPerson.name')}
                      placeholder="İletişim kişisi adı"
                    />
                    {errors.contactPerson?.name && (
                      <p className="text-sm text-red-500">{errors.contactPerson.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPerson.title">Ünvan</Label>
                    <Input
                      id="contactPerson.title"
                      {...register('contactPerson.title')}
                      placeholder="Ünvan"
                    />
                    {errors.contactPerson?.title && (
                      <p className="text-sm text-red-500">{errors.contactPerson.title.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPerson.phone">Telefon</Label>
                    <Input
                      id="contactPerson.phone"
                      {...register('contactPerson.phone')}
                      placeholder="Telefon numarası"
                    />
                    {errors.contactPerson?.phone && (
                      <p className="text-sm text-red-500">{errors.contactPerson.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPerson.email">E-posta</Label>
                    <Input
                      id="contactPerson.email"
                      type="email"
                      {...register('contactPerson.email')}
                      placeholder="E-posta adresi"
                    />
                    {errors.contactPerson?.email && (
                      <p className="text-sm text-red-500">{errors.contactPerson.email.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="yemeksepeti" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlugZap className="h-5 w-5" />
                  Yemeksepeti Entegrasyonu
                </CardTitle>
                <CardDescription>
                  Her firma için ayrı Yemeksepeti kimlik ve token bilgilerinizi girin. Bu bilgiler sipariş oluşturma ve callback doğrulaması için kullanılır.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/40">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">Entegrasyon Durumu</p>
                      <p className="text-xs text-muted-foreground">
                        Aktif olduğunda siparişler alınır ve callback gönderimleri yapılır.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Pasif</span>
                    <Switch
                      checked={watchYemeksepeti('isActive') ?? true}
                      onCheckedChange={(checked) => setYemeksepetiValue('isActive', checked)}
                    />
                    <span className="text-sm text-muted-foreground">Aktif</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="remoteId">remoteId</Label>
                    <Input
                      id="remoteId"
                      placeholder="Yemeksepeti remoteId"
                      {...registerYemeksepeti('remoteId')}
                    />
                    {yemeksepetiErrors.remoteId && (
                      <p className="text-sm text-red-500">{yemeksepetiErrors.remoteId.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="posVendorId">POS Vendor ID</Label>
                    <Input
                      id="posVendorId"
                      placeholder="POS Vendor ID"
                      {...registerYemeksepeti('posVendorId')}
                    />
                    {yemeksepetiErrors.posVendorId && (
                      <p className="text-sm text-red-500">{yemeksepetiErrors.posVendorId.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chainCode">Chain Code</Label>
                    <Input
                      id="chainCode"
                      placeholder="Zincir kodu (opsiyonel)"
                      {...registerYemeksepeti('chainCode')}
                    />
                    {yemeksepetiErrors.chainCode && (
                      <p className="text-sm text-red-500">{yemeksepetiErrors.chainCode.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brandCode">Brand Code</Label>
                    <Input
                      id="brandCode"
                      placeholder="Marka kodu (opsiyonel)"
                      {...registerYemeksepeti('brandCode')}
                    />
                    {yemeksepetiErrors.brandCode && (
                      <p className="text-sm text-red-500">{yemeksepetiErrors.brandCode.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="platformRestaurantId">Platform Restoran ID</Label>
                    <Input
                      id="platformRestaurantId"
                      placeholder="Platform restoran ID (opsiyonel)"
                      {...registerYemeksepeti('platformRestaurantId')}
                    />
                    {yemeksepetiErrors.platformRestaurantId && (
                      <p className="text-sm text-red-500">{yemeksepetiErrors.platformRestaurantId.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inboundToken" className="flex items-center gap-2">
                      <KeyRound className="h-4 w-4 text-muted-foreground" />
                      Inbound Token
                    </Label>
                    <Input
                      id="inboundToken"
                      placeholder="Yemeksepeti çağrıları için Bearer token"
                      {...registerYemeksepeti('inboundToken')}
                    />
                    {yemeksepetiErrors.inboundToken && (
                      <p className="text-sm text-red-500">{yemeksepetiErrors.inboundToken.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientId">Client ID</Label>
                    <Input
                      id="clientId"
                      placeholder="OAuth client id"
                      {...registerYemeksepeti('clientId')}
                    />
                    {yemeksepetiErrors.clientId && (
                      <p className="text-sm text-red-500">{yemeksepetiErrors.clientId.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientSecret">Client Secret</Label>
                    <Input
                      id="clientSecret"
                      placeholder="OAuth client secret"
                      type="password"
                      {...registerYemeksepeti('clientSecret')}
                    />
                    {yemeksepetiErrors.clientSecret && (
                      <p className="text-sm text-red-500">{yemeksepetiErrors.clientSecret.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tokenUrl">Token URL</Label>
                    <Input
                      id="tokenUrl"
                      placeholder="https://..."
                      {...registerYemeksepeti('tokenUrl')}
                    />
                    {yemeksepetiErrors.tokenUrl && (
                      <p className="text-sm text-red-500">{yemeksepetiErrors.tokenUrl.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="baseUrl">Middleware Base URL</Label>
                    <Input
                      id="baseUrl"
                      placeholder="https://..."
                      {...registerYemeksepeti('baseUrl')}
                    />
                    {yemeksepetiErrors.baseUrl && (
                      <p className="text-sm text-red-500">{yemeksepetiErrors.baseUrl.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="pickupAddress.lat">Pickup Enlem (lat)</Label>
                    <Input
                      id="pickupAddress.lat"
                      type="number"
                      step="any"
                      placeholder="Örn: 41.012"
                      {...registerYemeksepeti('pickupAddress.lat')}
                    />
                    {yemeksepetiErrors.pickupAddress?.lat && (
                      <p className="text-sm text-red-500">{yemeksepetiErrors.pickupAddress.lat.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pickupAddress.lng">Pickup Boylam (lng)</Label>
                    <Input
                      id="pickupAddress.lng"
                      type="number"
                      step="any"
                      placeholder="Örn: 29.123"
                      {...registerYemeksepeti('pickupAddress.lng')}
                    />
                    {yemeksepetiErrors.pickupAddress?.lng && (
                      <p className="text-sm text-red-500">{yemeksepetiErrors.pickupAddress.lng.message}</p>
                    )}
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="pickupAddress.address">Pickup Adresi</Label>
                    <Input
                      id="pickupAddress.address"
                      placeholder="Restoran adresi"
                      {...registerYemeksepeti('pickupAddress.address')}
                    />
                    {yemeksepetiErrors.pickupAddress?.address && (
                      <p className="text-sm text-red-500">{yemeksepetiErrors.pickupAddress.address.message}</p>
                    )}
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="pickupAddress.detail">Pickup Adres Detayı</Label>
                    <Textarea
                      id="pickupAddress.detail"
                      placeholder="Adres detayı (kat, kapı vs.)"
                      rows={2}
                      {...registerYemeksepeti('pickupAddress.detail')}
                    />
                    {yemeksepetiErrors.pickupAddress?.detail && (
                      <p className="text-sm text-red-500">{yemeksepetiErrors.pickupAddress.detail.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={handleYemeksepetiSubmit(onYemeksepetiSubmit)}
                    disabled={yemeksepetiSaving || yemeksepetiLoading}
                  >
                    {yemeksepetiSaving ? 'Kaydediliyor...' : 'Yemeksepeti Bilgilerini Kaydet'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {yemeksepetiSettings && (
              <Alert>
                <AlertDescription className="flex items-center gap-2">
                  <Power className="h-4 w-4" />
                  En son güncelleme: {new Date(yemeksepetiSettings.updatedAt).toLocaleString('tr-TR')}
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Şifre Değiştir
                </CardTitle>
                <CardDescription>
                  Hesap güvenliğiniz için şifrenizi düzenli olarak değiştirin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="oldPassword">Mevcut Şifre</Label>
                    <Input
                      id="oldPassword"
                      type="password"
                      {...registerPassword('oldPassword')}
                      placeholder="Mevcut şifrenizi giriniz"
                    />
                    {passwordErrors.oldPassword && (
                      <p className="text-sm text-red-500">{passwordErrors.oldPassword.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Yeni Şifre</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      {...registerPassword('newPassword')}
                      placeholder="Yeni şifrenizi giriniz"
                    />
                    {passwordErrors.newPassword && (
                      <p className="text-sm text-red-500">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...registerPassword('confirmPassword')}
                      placeholder="Yeni şifrenizi tekrar giriniz"
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-sm text-red-500">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button 
                    type="button" 
                    onClick={handlePasswordSubmit(onPasswordSubmit)}
                    disabled={changingPassword}
                  >
                    {changingPassword ? 'Şifre Değiştiriliyor...' : 'Şifreyi Değiştir'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {activeTab !== 'security' && activeTab !== 'yemeksepeti' && (
          <div className="flex justify-end mt-6">
            <Button type="submit" disabled={updating}>
              {updating ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
            </Button>
          </div>
        )}
      </form>

      {profile.documents && profile.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Belgeler
            </CardTitle>
            <CardDescription>
              Yüklediğiniz belgeler ve durumları
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {profile.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{getDocumentTypeLabel(doc.type)}</span>
                  </div>
                  {getStatusBadge(doc.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Hesap Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">E-posta</p>
              <p className="font-medium">{profile.user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Kayıt Tarihi</p>
              <p className="font-medium">
                {new Date(profile.user.createdAt).toLocaleDateString('tr-TR')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hesap Durumu</p>
              <div className="mt-1">
                {getStatusBadge(profile.user.status)}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Son Güncelleme</p>
              <p className="font-medium">
                {new Date(profile.updatedAt).toLocaleDateString('tr-TR')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
