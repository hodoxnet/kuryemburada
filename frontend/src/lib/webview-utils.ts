/**
 * WebView Detection ve Utility Fonksiyonları
 */

// Global interface tanımlamaları
declare global {
  interface Window {
    isNativeApp?: boolean;
    isWebView?: boolean;
    platform?: 'ios' | 'android' | 'web';
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
    receiveFromNative?: (message: any) => void;
  }
}

/**
 * WebView içinde mi kontrol et
 */
export function isWebView(): boolean {
  if (typeof window === 'undefined') return false;
  
  // React Native WebView tarafından inject edilen değişken
  if (window.isNativeApp || window.isWebView) {
    return true;
  }
  
  const userAgent = window.navigator.userAgent;
  
  // iOS WebView kontrolü
  const isIOSWebView = /iPhone|iPod|iPad/.test(userAgent) && 
    /AppleWebKit/.test(userAgent) && 
    !/Safari/.test(userAgent);
  
  // Android WebView kontrolü
  const isAndroidWebView = /Android/.test(userAgent) && 
    /wv/.test(userAgent);
  
  // Custom user agent kontrolü (KuryeApp)
  const isKuryeApp = /KuryeApp\//.test(userAgent);
  
  return isIOSWebView || isAndroidWebView || isKuryeApp;
}

/**
 * Platform bilgisini al
 */
export function getPlatform(): 'ios' | 'android' | 'web' {
  if (typeof window === 'undefined') return 'web';
  
  // React Native WebView tarafından set edilen platform
  if (window.platform) {
    return window.platform;
  }
  
  const userAgent = window.navigator.userAgent;
  
  if (/iPhone|iPod|iPad/.test(userAgent)) {
    return 'ios';
  }
  
  if (/Android/.test(userAgent)) {
    return 'android';
  }
  
  return 'web';
}

/**
 * WebView'a mesaj gönder
 */
export function postToNative(message: any): void {
  if (!isWebView()) return;
  
  try {
    if (window.ReactNativeWebView?.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify(message));
    }
  } catch (error) {
    console.error('Native mesaj gönderilemedi:', error);
  }
}

/**
 * Native'den mesaj dinle
 */
export function listenToNative(callback: (message: any) => void): () => void {
  if (!isWebView()) {
    return () => {};
  }
  
  // Global fonksiyon tanımla
  window.receiveFromNative = callback;
  
  // Cleanup fonksiyonu döndür
  return () => {
    delete window.receiveFromNative;
  };
}

/**
 * WebView'a özel class ekle
 */
export function addWebViewClass(): void {
  if (typeof document === 'undefined') return;
  
  if (isWebView()) {
    document.documentElement.classList.add('webview');
    
    const platform = getPlatform();
    document.documentElement.classList.add(`platform-${platform}`);
  }
}

/**
 * WebView için viewport meta tag'leri ayarla
 */
export function setupViewportForWebView(): void {
  if (!isWebView() || typeof document === 'undefined') return;
  
  let viewport = document.querySelector('meta[name="viewport"]');
  
  if (!viewport) {
    viewport = document.createElement('meta');
    viewport.setAttribute('name', 'viewport');
    document.head.appendChild(viewport);
  }
  
  viewport.setAttribute('content', 
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
  );
}

/**
 * WebView başlatma
 */
export function initWebView(): void {
  if (typeof window === 'undefined') return;
  
  // Class ekle
  addWebViewClass();
  
  // Viewport ayarla
  setupViewportForWebView();
  
  // WebView'a hazır olduğunu bildir
  if (isWebView()) {
    postToNative({ 
      type: 'WEB_READY',
      data: { 
        platform: getPlatform(),
        timestamp: Date.now(),
        url: window.location.href
      }
    });
    
    console.log('WebView initialized:', {
      isWebView: true,
      platform: getPlatform(),
      userAgent: window.navigator.userAgent
    });
  }
}

/**
 * Telefon araması başlat
 */
export function makePhoneCall(phoneNumber: string): void {
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  if (isWebView()) {
    // Native uygulamaya mesaj gönder
    postToNative({
      type: 'PHONE_CALL',
      data: { number: cleanNumber }
    });
  } else {
    // Web'de tel: protokolünü kullan
    window.location.href = `tel:${cleanNumber}`;
  }
}

/**
 * Harita uygulamasında aç
 */
export function openInMaps(address: string, lat?: number, lng?: number): void {
  if (isWebView()) {
    // Native uygulamaya mesaj gönder
    postToNative({
      type: 'OPEN_MAPS',
      data: { address, lat, lng }
    });
  } else {
    // Web'de Google Maps'i aç
    const encodedAddress = encodeURIComponent(address);
    if (lat && lng) {
      window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank');
    } else {
      window.open(`https://maps.google.com/?q=${encodedAddress}`, '_blank');
    }
  }
}

/**
 * Vibrate (titreşim)
 */
export function vibrate(pattern: number | number[] = 200): void {
  if (isWebView()) {
    postToNative({
      type: 'VIBRATE',
      data: { pattern }
    });
  } else if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

/**
 * Share (paylaş)
 */
export async function share(data: { title?: string; text?: string; url?: string }): Promise<void> {
  if (isWebView()) {
    postToNative({
      type: 'SHARE',
      data
    });
  } else if (navigator.share) {
    try {
      await navigator.share(data);
    } catch (error) {
      console.error('Share failed:', error);
    }
  }
}