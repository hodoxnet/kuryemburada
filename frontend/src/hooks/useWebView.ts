/**
 * WebView özelliklerini kullanmak için React Hook
 */

import { useEffect, useState, useCallback } from 'react';
import { 
  isWebView, 
  getPlatform, 
  postToNative, 
  listenToNative,
  makePhoneCall as webViewMakePhoneCall,
  openInMaps as webViewOpenInMaps,
  vibrate as webViewVibrate,
  share as webViewShare
} from '@/lib/webview-utils';

export function useWebView() {
  const [isInWebView, setIsInWebView] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'web'>('web');
  const [nativeMessage, setNativeMessage] = useState<any>(null);
  
  useEffect(() => {
    // WebView kontrolü
    setIsInWebView(isWebView());
    setPlatform(getPlatform());
    
    // Native mesajları dinle
    const cleanup = listenToNative((message) => {
      console.log('Hook - Native mesaj:', message);
      setNativeMessage(message);
    });
    
    return cleanup;
  }, []);
  
  // Native'e mesaj gönder
  const sendToNative = useCallback((type: string, data?: any) => {
    postToNative({ type, data, timestamp: Date.now() });
  }, []);
  
  // Telefon araması yap
  const makePhoneCall = useCallback((phoneNumber: string) => {
    webViewMakePhoneCall(phoneNumber);
  }, []);
  
  // Harita uygulamasında aç
  const openInMaps = useCallback((address: string, lat?: number, lng?: number) => {
    webViewOpenInMaps(address, lat, lng);
  }, []);
  
  // Titreşim
  const vibrate = useCallback((pattern?: number | number[]) => {
    webViewVibrate(pattern);
  }, []);
  
  // Paylaş
  const share = useCallback(async (data: { title?: string; text?: string; url?: string }) => {
    await webViewShare(data);
  }, []);
  
  // Uygulama bilgisi iste
  const requestAppInfo = useCallback(() => {
    sendToNative('GET_APP_INFO');
  }, [sendToNative]);
  
  // Bildirimleri etkinleştir
  const requestNotificationPermission = useCallback(() => {
    sendToNative('REQUEST_NOTIFICATION_PERMISSION');
  }, [sendToNative]);
  
  return {
    // State
    isWebView: isInWebView,
    platform,
    nativeMessage,
    
    // Actions
    sendToNative,
    makePhoneCall,
    openInMaps,
    vibrate,
    share,
    requestAppInfo,
    requestNotificationPermission,
  };
}