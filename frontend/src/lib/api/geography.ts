import apiClient from '../api-client';

export interface Province {
  id: string;
  name: string;
  plateCode: string;
}

export interface District {
  id: string;
  name: string;
  provinceId: string;
}

/**
 * Tüm illeri getir
 */
export const getAllProvinces = async (): Promise<Province[]> => {
  const response = await apiClient.get('/geography/provinces');
  return response.data;
};

/**
 * İle ait ilçeleri getir
 */
export const getDistrictsByProvinceId = async (provinceId: string): Promise<District[]> => {
  const response = await apiClient.get(`/geography/provinces/${provinceId}/districts`);
  return response.data;
};

/**
 * Plaka koduna göre il getir
 */
export const getProvinceByPlateCode = async (plateCode: string) => {
  const response = await apiClient.get(`/geography/provinces/plate/${plateCode}`);
  return response.data;
};

/**
 * İl adına göre il ve ilçeleri getir
 */
export const getProvinceByName = async (name: string) => {
  const response = await apiClient.get(`/geography/provinces/name/${name}`);
  return response.data;
};
