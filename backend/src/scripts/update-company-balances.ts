import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateCompanyBalances() {
  console.log('🔄 Firma cari bakiyeleri güncelleniyor...');

  try {
    // Tüm onaylı firmaları al
    const companies = await prisma.company.findMany({
      where: { status: 'APPROVED' },
    });

    for (const company of companies) {
      console.log(`\n📊 ${company.name} için cari hesaplama yapılıyor...`);

      // Firmanın tüm siparişlerini al
      const orders = await prisma.order.findMany({
        where: { companyId: company.id },
        include: { payments: true },
      });

      // Toplam borç (tüm siparişlerin toplam tutarı)
      const totalDebts = orders.reduce((sum, order) => sum + order.price, 0);

      // Toplam ödemeler (tamamlanmış ödemeler)
      const totalCredits = orders.reduce((sum, order) => {
        const completedPayments = order.payments
          .filter(p => p.status === 'COMPLETED')
          .reduce((pSum, p) => pSum + p.amount, 0);
        return sum + completedPayments;
      }, 0);

      // Mevcut borç (toplam borç - toplam ödemeler)
      const currentBalance = totalDebts - totalCredits;

      // Son ödeme bilgisi
      const lastPayment = await prisma.payment.findFirst({
        where: {
          status: 'COMPLETED',
          order: { companyId: company.id },
        },
        orderBy: { paidAt: 'desc' },
      });

      // CompanyBalance kaydını güncelle veya oluştur
      await prisma.companyBalance.upsert({
        where: { companyId: company.id },
        create: {
          companyId: company.id,
          currentBalance,
          totalDebts,
          totalCredits,
          lastPaymentDate: lastPayment?.paidAt || null,
          lastPaymentAmount: lastPayment?.amount || null,
        },
        update: {
          currentBalance,
          totalDebts,
          totalCredits,
          lastPaymentDate: lastPayment?.paidAt || null,
          lastPaymentAmount: lastPayment?.amount || null,
          updatedAt: new Date(),
        },
      });

      console.log(`✅ ${company.name}:`);
      console.log(`   - Toplam Borç: ₺${totalDebts.toFixed(2)}`);
      console.log(`   - Toplam Ödeme: ₺${totalCredits.toFixed(2)}`);
      console.log(`   - Mevcut Bakiye: ₺${currentBalance.toFixed(2)}`);
    }

    // Günlük mutabakat kayıtlarını da güncelle
    console.log('\n🔄 Günlük mutabakat kayıtları güncelleniyor...');
    
    for (const company of companies) {
      // Son 30 günün siparişlerini grupla
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const orders = await prisma.order.findMany({
        where: {
          companyId: company.id,
          createdAt: { gte: thirtyDaysAgo },
        },
        include: { payments: true },
      });

      // Günlere göre grupla
      const groupedByDate = orders.reduce((acc, order) => {
        const date = new Date(order.createdAt);
        date.setHours(0, 0, 0, 0);
        const dateKey = date.toISOString();

        if (!acc[dateKey]) {
          acc[dateKey] = {
            date,
            orders: [],
            totalAmount: 0,
            deliveredOrders: 0,
            cancelledOrders: 0,
            totalCommission: 0,
            totalCourierCost: 0,
            paidAmount: 0,
          };
        }

        acc[dateKey].orders.push(order);
        acc[dateKey].totalAmount += order.price;
        
        if (order.status === 'DELIVERED') acc[dateKey].deliveredOrders++;
        if (order.status === 'CANCELLED') acc[dateKey].cancelledOrders++;
        
        acc[dateKey].totalCommission += order.commission || 0;
        acc[dateKey].totalCourierCost += order.courierEarning || 0;

        // Ödemeleri hesapla
        const completedPayments = order.payments
          .filter(p => p.status === 'COMPLETED')
          .reduce((sum, p) => sum + p.amount, 0);
        acc[dateKey].paidAmount += completedPayments;

        return acc;
      }, {} as Record<string, any>);

      // Her gün için mutabakat kaydı oluştur/güncelle
      for (const [dateKey, data] of Object.entries(groupedByDate)) {
        await prisma.dailyReconciliation.upsert({
          where: {
            companyId_date: {
              companyId: company.id,
              date: data.date,
            },
          },
          create: {
            companyId: company.id,
            date: data.date,
            totalOrders: data.orders.length,
            deliveredOrders: data.deliveredOrders,
            cancelledOrders: data.cancelledOrders,
            totalAmount: data.totalAmount,
            courierCost: data.totalCourierCost,
            platformCommission: data.totalCommission,
            netAmount: data.totalAmount,
            paidAmount: data.paidAmount,
            status: data.paidAmount >= data.totalAmount ? 'PAID' : 
                   data.paidAmount > 0 ? 'PARTIALLY_PAID' : 'PENDING',
          },
          update: {
            totalOrders: data.orders.length,
            deliveredOrders: data.deliveredOrders,
            cancelledOrders: data.cancelledOrders,
            totalAmount: data.totalAmount,
            courierCost: data.totalCourierCost,
            platformCommission: data.totalCommission,
            netAmount: data.totalAmount,
            paidAmount: data.paidAmount,
            status: data.paidAmount >= data.totalAmount ? 'PAID' : 
                   data.paidAmount > 0 ? 'PARTIALLY_PAID' : 'PENDING',
            updatedAt: new Date(),
          },
        });
      }

      console.log(`✅ ${company.name} için ${Object.keys(groupedByDate).length} günlük mutabakat kaydı güncellendi`);
    }

    console.log('\n✅ Tüm cari bakiyeler ve mutabakat kayıtları başarıyla güncellendi!');
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Script'i çalıştır
updateCompanyBalances();