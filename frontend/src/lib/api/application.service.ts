import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface CourierApplicationData {
  email: string;
  password: string;
  tcNumber: string;
  fullName: string;
  phone: string;
  birthDate?: string;
  address: {
    city: string;
    district: string;
    neighborhood: string;
    street: string;
    detail: string;
  };
  licenseInfo?: {
    class: string;
    issueDate: string;
    expiryDate: string;
    number: string;
  };
  vehicleInfo?: {
    plate: string;
    brand: string;
    model: string;
    year?: string;
    registrationNo?: string;
  };
  bankInfo?: {
    bankName: string;
    iban: string;
    accountHolder: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship?: string;
  };
  hasVehicle?: boolean;
}

export interface CompanyApplicationData {
  email: string;
  password: string;
  name: string;
  taxNumber: string;
  taxOffice: string;
  phone: string;
  companyEmail: string;
  address: {
    city: string;
    district: string;
    neighborhood: string;
    street: string;
    detail: string;
  };
  kepAddress?: string;
  tradeLicenseNo?: string;
  activityArea?: string;
  website?: string;
  bankInfo?: {
    bankName: string;
    iban: string;
    accountHolder: string;
  };
  contactPerson: {
    name: string;
    phone: string;
    email: string;
    title: string;
  };
  employeeCount?: string;
  monthlyShipmentVolume?: string;
  currentLogisticsProvider?: string;
}

class ApplicationService {
  async submitCourierApplication(data: CourierApplicationData, files?: { [key: string]: File }) {
    try {
      const formData = new FormData();
      
      // JSON veriyi string olarak ekle
      formData.append('data', JSON.stringify(data));
      
      // Belgeleri ekle - fieldName'i filename olarak gönder
      if (files) {
        Object.entries(files).forEach(([fieldName, file]) => {
          if (file) {
            // Dosyanın orijinal adını fieldName ile birleştir
            const fileName = `${fieldName}_${file.name}`;
            formData.append('documents', file, fileName);
          }
        });
      }
      
      const response = await axios.post(`${API_URL}/auth/register/courier`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Kurye başvurusu sırasında bir hata oluştu');
    }
  }

  async submitCompanyApplication(data: CompanyApplicationData, files?: { [key: string]: File }) {
    try {
      const formData = new FormData();
      
      // JSON veriyi string olarak ekle
      formData.append('data', JSON.stringify(data));
      
      // Belgeleri ekle - fieldName'i filename olarak gönder
      if (files) {
        Object.entries(files).forEach(([fieldName, file]) => {
          if (file) {
            // Dosyanın orijinal adını fieldName ile birleştir
            const fileName = `${fieldName}_${file.name}`;
            formData.append('documents', file, fileName);
          }
        });
      }
      
      const response = await axios.post(`${API_URL}/auth/register/company`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Firma başvurusu sırasında bir hata oluştu');
    }
  }

  async uploadDocument(file: File, type: string, userId?: string) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      if (userId) {
        formData.append('userId', userId);
      }

      const response = await axios.post(`${API_URL}/documents/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Belge yükleme sırasında bir hata oluştu');
    }
  }

  async checkApplicationStatus(email: string) {
    try {
      const response = await axios.get(`${API_URL}/applications/status`, {
        params: { email },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Başvuru durumu sorgulanamadı');
    }
  }
}

export const applicationService = new ApplicationService();