'use client';

import { useState, useEffect } from 'react';
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
import { Building2, MapPin, Phone, Mail, CreditCard, User, FileText, Info } from 'lucide-react';
import companyAPI, { CompanyProfile, UpdateCompanyData } from '@/lib/api/company';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

type CompanyUpdateForm = z.infer<typeof companyUpdateSchema>;

export default function CompanyProfilePage() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
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

  useEffect(() => {
    fetchProfile();
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

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Genel Bilgiler</TabsTrigger>
            <TabsTrigger value="address">Adres Bilgileri</TabsTrigger>
            <TabsTrigger value="bank">Banka Bilgileri</TabsTrigger>
            <TabsTrigger value="contact">İletişim Kişisi</TabsTrigger>
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
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button type="submit" disabled={updating}>
            {updating ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
          </Button>
        </div>
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