/**
 * Uygulama sabitleri
 */

import { Platform } from 'react-native';

export const APP_CONFIG = {
  // Uygulama bilgileri
  APP_NAME: 'Kurye',
  APP_VERSION: '1.0.0',
  APP_BUILD: 1,

  // URL'ler - Sunucu API'si (direkt kurye login sayfası)
  WEB_URL_DEV: 'https://kurye.kuryemburada.com/courier/login',
  WEB_URL_PROD: 'https://kurye.kuryemburada.com/courier/login',
  WEB_URL_IOS_DEV: 'https://kurye.kuryemburada.com/courier/login',

  // Timeout değerleri (milisaniye)
  NETWORK_TIMEOUT: 10000,
  PAGE_LOAD_TIMEOUT: 30000,

  // Retry değerleri
  MAX_RETRY_COUNT: 3,
  RETRY_DELAY: 2000,

  // Cache
  COOKIE_PERSISTENCE: true,
  CACHE_ENABLED: true,
};

// Platform kontrolleri
export const IS_DEV = __DEV__;
export const IS_ANDROID = Platform.OS === 'android';
export const IS_IOS = Platform.OS === 'ios';

// Web URL
export const WEB_URL = IS_DEV 
  ? (IS_IOS ? APP_CONFIG.WEB_URL_IOS_DEV : APP_CONFIG.WEB_URL_DEV)
  : APP_CONFIG.WEB_URL_PROD;