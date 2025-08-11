import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Varsayılan admin kullanıcısı
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@kuryem.com' },
    update: {},
    create: {
      email: 'admin@kuryem.com',
      password: adminPassword,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  console.log('Admin kullanıcı oluşturuldu:', admin.email);

  // Test firma kullanıcısı
  const companyPassword = await bcrypt.hash('firma123', 10);
  const companyUser = await prisma.user.upsert({
    where: { email: 'firma@test.com' },
    update: {},
    create: {
      email: 'firma@test.com',
      password: companyPassword,
      role: UserRole.COMPANY,
      status: UserStatus.ACTIVE,
    },
  });

  // Firma profili oluştur
  const company = await prisma.company.upsert({
    where: { userId: companyUser.id },
    update: {},
    create: {
      userId: companyUser.id,
      name: 'Test Firma A.Ş.',
      taxNumber: '1234567890',
      taxOffice: 'Ankara Vergi Dairesi',
      phone: '0312 123 45 67',
      address: {
        city: 'Ankara',
        district: 'Çankaya',
        detail: 'Test Sokak No:1',
      },
      status: 'APPROVED',
    },
  });

  console.log('Firma kullanıcı oluşturuldu:', companyUser.email);

  // Test kurye kullanıcısı
  const courierPassword = await bcrypt.hash('kurye123', 10);
  const courierUser = await prisma.user.upsert({
    where: { email: 'kurye@test.com' },
    update: {},
    create: {
      email: 'kurye@test.com',
      password: courierPassword,
      role: UserRole.COURIER,
      status: UserStatus.ACTIVE,
    },
  });

  // Kurye profili oluştur
  const courier = await prisma.courier.upsert({
    where: { userId: courierUser.id },
    update: {},
    create: {
      userId: courierUser.id,
      tcNumber: '12345678901',
      fullName: 'Ahmet Yılmaz',
      phone: '0555 123 45 67',
      birthDate: new Date('1990-01-01'),
      licenseInfo: {
        type: 'B',
        issueDate: '2010-01-01',
        expiryDate: '2025-01-01',
      },
      vehicleInfo: {
        brand: 'Honda',
        model: 'PCX 125',
        plate: '34 ABC 123',
        year: 2020,
      },
      status: 'APPROVED',
    },
  });

  console.log('Kurye kullanıcı oluşturuldu:', courierUser.email);

  // Varsayılan sistem ayarları
  const defaultSettings = [
    { key: 'commission.rate', value: 0.15, description: 'Komisyon oranı' },
    { key: 'commission.minAmount', value: 5, description: 'Minimum komisyon tutarı' },
    { key: 'order.maxCancellationTime', value: 5, description: 'İptal süresi (dakika)' },
    { key: 'order.autoAssignRadius', value: 5, description: 'Otomatik atama yarıçapı (km)' },
  ];

  for (const setting of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log('Sistem ayarları oluşturuldu');

  // Örnek fiyatlandırma kuralı
  const pricingRule = await prisma.pricingRule.upsert({
    where: { name: 'Standart Mesafe Fiyatlandırması' },
    update: {},
    create: {
      name: 'Standart Mesafe Fiyatlandırması',
      description: 'Kilometre başına fiyatlandırma',
      basePrice: 15,
      pricePerKm: 3,
      pricePerMinute: 0.5,
      minimumPrice: 10,
      rushHourMultiplier: 1.5,
      weatherMultiplier: 1.2,
      isActive: true,
    },
  });

  console.log('Fiyatlandırma kuralı oluşturuldu:', pricingRule.name);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Seed işlemi tamamlandı!');
  })
  .catch(async (e) => {
    console.error('Seed hatası:', e);
    await prisma.$disconnect();
    process.exit(1);
  });