import apiClient from '../api-client';
import { AuthService } from '../auth';

export interface Document {
  id: string;
  type: string;
  fileName: string;
  fileSize: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  verifiedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentUploadData {
  type: string;
  notes?: string;
}

const documentsAPI = {
  // Kullanıcının belgelerini listele
  async getMyDocuments(): Promise<Document[]> {
    const response = await apiClient.get('/documents/my-documents');
    return response.data;
  },

  // Belge yükle
  async uploadDocument(file: File, data: DocumentUploadData): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', data.type);
    if (data.notes) {
      formData.append('description', data.notes);
    }

    const response = await apiClient.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Belge detayını getir
  async getDocument(id: string): Promise<Document> {
    const response = await apiClient.get(`/documents/${id}`);
    return response.data;
  },

  // Belgeyi görüntüle (yeni sekmede aç)
  viewDocument(id: string): void {
    const token = AuthService.getAccessToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    
    // Yeni sekmede belgeyi aç
    const url = `${process.env.NEXT_PUBLIC_API_URL}/documents/${id}/view`;
    window.open(`${url}?token=${encodeURIComponent(token)}`, '_blank');
  },

  // Belgeyi indir
  async downloadDocument(id: string, fileName: string): Promise<void> {
    const response = await apiClient.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], {
      type: response.headers['content-type'] || 'application/octet-stream',
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Belgeyi sil (admin için)
  async deleteDocument(id: string): Promise<void> {
    await apiClient.delete(`/documents/${id}`);
  },
};

export default documentsAPI;
