import apiClient from '@/lib/api-client';

export interface Address {
  city: string;
  district: string;
  neighborhood: string;
  street: string;
  detail: string;
}

export interface BankInfo {
  bankName: string;
  iban: string;
  accountHolder: string;
}

export interface ContactPerson {
  name: string;
  phone: string;
  email: string;
  title: string;
}

export interface YemeksepetiPickupAddress {
  lat: number;
  lng: number;
  address?: string;
  detail?: string;
}

export interface YemeksepetiVendorSettings {
  id: string;
  companyId: string;
  remoteId: string;
  posVendorId: string;
  chainCode?: string | null;
  brandCode?: string | null;
  platformRestaurantId?: string | null;
  pickupAddress: YemeksepetiPickupAddress | null;
  isActive: boolean;
  autoCourierDispatch: boolean;
  clientId?: string | null;
  clientSecret?: string | null;
  inboundToken?: string | null;
  tokenUrl?: string | null;
  baseUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyProfile {
  id: string;
  userId: string;
  name: string;
  taxNumber: string | null;
  taxOffice: string | null;
  kepAddress: string | null;
  phone: string;
  address: Address;
  bankInfo: BankInfo | null;
  contactPerson: ContactPerson | null;
  activityArea: string | null;
  tradeLicenseNo: string | null;
  defaultPackageType: string | null;
  status: string;
  approvalReason: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    createdAt: string;
    status: string;
  };
  documents: Array<{
    id: string;
    type: string;
    status: string;
    createdAt: string;
  }>;
}

export interface UpdateCompanyData {
  name?: string;
  phone?: string;
  kepAddress?: string;
  activityArea?: string;
  taxOffice?: string;
  defaultPackageType?: string;
  address?: Address;
  bankInfo?: BankInfo;
  contactPerson?: ContactPerson;
}

export interface UpsertYemeksepetiVendorInput {
  remoteId: string;
  posVendorId: string;
  chainCode?: string;
  brandCode?: string;
  platformRestaurantId?: string;
  pickupAddress: YemeksepetiPickupAddress;
  isActive?: boolean;
  autoCourierDispatch?: boolean;
  clientId?: string;
  clientSecret?: string;
  inboundToken?: string;
  tokenUrl?: string;
  baseUrl?: string;
}

class CompanyAPI {
  async getProfile(): Promise<CompanyProfile> {
    const response = await apiClient.get('/companies/profile');
    return response.data;
  }

  async updateProfile(data: UpdateCompanyData): Promise<CompanyProfile> {
    const response = await apiClient.patch('/companies/profile', data);
    return response.data;
  }

  async getYemeksepetiSettings(): Promise<YemeksepetiVendorSettings | null> {
    const response = await apiClient.get('/companies/profile/yemeksepeti');
    return response.data;
  }

  async upsertYemeksepetiSettings(
    data: UpsertYemeksepetiVendorInput,
  ): Promise<YemeksepetiVendorSettings> {
    const response = await apiClient.put('/companies/profile/yemeksepeti', data);
    return response.data;
  }
}

export default new CompanyAPI();
