'use client';

import { useEffect } from 'react';
import { initWebView, listenToNative } from '@/lib/webview-utils';

/**
 * WebView başlatma komponenti
 * Layout'a eklenerek tüm uygulama boyunca WebView desteği sağlar
 */
export function WebViewInit() {
  useEffect(() => {
    // WebView başlatma
    initWebView();
    
    // Native'den gelen mesajları dinle
    const cleanup = listenToNative((message) => {
      console.log('Native mesaj:', message);
      
      // Mesaj tipine göre işlem yap
      switch (message.type) {
        case 'AUTH_TOKEN':
          // Token güncelleme
          break;
        case 'LOCATION':
          // Konum bilgisi
          break;
        case 'NOTIFICATION':
          // Bildirim
          break;
        default:
          break;
      }
    });
    
    return cleanup;
  }, []);
  
  return null;
}