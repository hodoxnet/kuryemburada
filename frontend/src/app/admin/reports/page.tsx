'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Bike, TrendingUp, FileText, DollarSign } from 'lucide-react';
import DashboardStats from '@/components/reports/DashboardStats';
import CompanyReports from '@/components/reports/CompanyReports';
import CourierReports from '@/components/reports/CourierReports';
import RevenueReports from '@/components/reports/RevenueReports';
import OrderReports from '@/components/reports/OrderReports';
import PaymentReports from '@/components/reports/PaymentReports';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Raporlar</h1>
        <p className="text-gray-600 mt-2">
          Detaylı raporlar ve analizler
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 gap-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Özet</span>
          </TabsTrigger>
          <TabsTrigger value="companies" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Firmalar</span>
          </TabsTrigger>
          <TabsTrigger value="couriers" className="flex items-center gap-2">
            <Bike className="w-4 h-4" />
            <span className="hidden sm:inline">Kuryeler</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Siparişler</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Ödemeler</span>
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Gelir</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <DashboardStats />
        </TabsContent>

        <TabsContent value="companies" className="space-y-6">
          <CompanyReports />
        </TabsContent>

        <TabsContent value="couriers" className="space-y-6">
          <CourierReports />
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <OrderReports />
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <PaymentReports />
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <RevenueReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}