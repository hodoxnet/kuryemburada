/**
 * WebView konfigürasyonları
 */

import { WebViewProps } from 'react-native-webview';
import { IS_ANDROID, IS_IOS } from './constants';

export const webViewConfig: Partial<WebViewProps> = {
  // JavaScript ve Storage
  javaScriptEnabled: true,
  domStorageEnabled: true,
  
  // LocalStorage ve SessionStorage için gerekli
  localStorage: true,
  
  // Cache ve Cookie - Android'de cookie sorununu çözer
  cacheEnabled: true,
  cacheMode: 'LOAD_DEFAULT',
  sharedCookiesEnabled: true,
  thirdPartyCookiesEnabled: true,
  
  // Zoom kontrolü
  scalesPageToFit: false,
  
  // Media
  allowsInlineMediaPlayback: true,
  mediaPlaybackRequiresUserAction: false,
  
  // Güvenlik
  mixedContentMode: __DEV__ ? 'always' : 'never',
  
  // User Agent
  applicationNameForUserAgent: 'KuryeApp/1.0.0',
  
  // iOS özel
  ...(IS_IOS && {
    allowsBackForwardNavigationGestures: true,
    allowsLinkPreview: false,
    hideKeyboardAccessoryView: true,
    keyboardDisplayRequiresUserAction: false,
    suppressesIncrementalRendering: false,
    decelerationRate: 'normal',
  }),
  
  // Android özel
  ...(IS_ANDROID && {
    textZoom: 100,
    geolocationEnabled: false,
    allowFileAccess: false,
    allowFileAccessFromFileURLs: false,
    allowUniversalAccessFromFileURLs: false,
    saveFormDataDisabled: false, // Form verilerini kaydet (login için)
    forceDarkOn: false,
    minimumFontSize: 1,
    // Android'de cookie ve storage sorunlarını çözer
    setSupportMultipleWindows: false,
    javaScriptCanOpenWindowsAutomatically: false,
  }),
};

// Injected JavaScript - WebView algılama ve debug
export const injectedJavaScript = `
  (function() {
    // WebView'da olduğumuzu belirt
    window.isNativeApp = true;
    window.isWebView = true;
    window.platform = '${IS_IOS ? 'ios' : 'android'}';
    window.isAndroidEmulator = ${IS_ANDROID};
    
    // Android emülatörde API URL'sini değiştir
    if (${IS_ANDROID}) {
      // Frontend'in API URL'sini Android emülatör için güncelle
      window.__ANDROID_API_URL__ = 'http://10.0.2.2:4004';
      
      // Axios interceptor'larını override et
      if (window.axios) {
        window.axios.defaults.baseURL = 'http://10.0.2.2:4004';
      }
      
      // Fetch API'yi intercept et ve localhost'u 10.0.2.2 ile değiştir
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        let [url, options] = args;
        // URL string veya URL objesi olabilir
        if (typeof url === 'string' && url.includes && url.includes('localhost:4004')) {
          url = url.replace('localhost:4004', '10.0.2.2:4004');
          console.log('Android: API URL değiştirildi:', url);
        } else if (url && typeof url === 'object' && url.href && url.href.includes('localhost:4004')) {
          // URL objesi ise
          url = new URL(url.href.replace('localhost:4004', '10.0.2.2:4004'));
          console.log('Android: URL objesi değiştirildi:', url.href);
        }
        return originalFetch.apply(window, [url, options]);
      };
      
      // XMLHttpRequest'i intercept et
      const originalXHROpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function(method, url, ...args) {
        if (typeof url === 'string' && url.includes('localhost:4004')) {
          url = url.replace('localhost:4004', '10.0.2.2:4004');
          console.log('Android: XHR URL değiştirildi:', url);
        }
        return originalXHROpen.apply(this, [method, url, ...args]);
      };
    }
    
    // LocalStorage'dan token kontrol et
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    
    // Console log'ları native'e gönder (debug için)
    if (${__DEV__}) {
      const originalLog = console.log;
      const originalError = console.error;
      
      console.log = function(...args) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'console',
          level: 'log',
          message: args.join(' ')
        }));
        originalLog.apply(console, args);
      };
      
      console.error = function(...args) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'console',
          level: 'error',
          message: args.join(' ')
        }));
        originalError.apply(console, args);
      };
      
      // Debug için XHR interceptor - Zaten yukarıda Android için intercept ettik, 
      // sadece debug mesajları ekleyelim
      const debugOriginalSend = XMLHttpRequest.prototype.send;
      
      XMLHttpRequest.prototype.send = function(data) {
        const xhr = this;
        // URL'yi open metodunda sakla
        const originalOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url, ...args) {
          this._url = url;
          this._method = method;
          // Android'de URL zaten değiştirilmiş olacak
          return originalOpen.apply(this, [method, url, ...args]);
        };
        
        xhr.addEventListener('load', function() {
          if (xhr._url && xhr._url.includes('/auth')) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'api_response',
              url: xhr._url,
              status: xhr.status,
              method: xhr._method,
              response: xhr.responseText.substring(0, 200) // İlk 200 karakter
            }));
          }
        });
        
        xhr.addEventListener('error', function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'api_error',
            url: xhr._url,
            method: xhr._method,
            error: 'Network error'
          }));
        });
        
        return debugOriginalSend.apply(this, [data]);
      };
      
      // Debug için Fetch API interceptor - Android'de zaten intercept edilmiş
      const debugOriginalFetch = window.fetch;
      window.fetch = function(...args) {
        let [url, options] = args;
        
        // URL'yi string'e çevir (string veya URL objesi olabilir)
        const urlString = typeof url === 'string' ? url : (url && url.href ? url.href : String(url));
        
        // Android için URL zaten değiştirilmiş olacak, sadece debug ekle
        return debugOriginalFetch.apply(window, [url, options])
          .then(response => {
            if (urlString && urlString.includes && urlString.includes('/auth')) {
              response.clone().text().then(text => {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'fetch_response',
                  url: urlString,
                  status: response.status,
                  method: options?.method || 'GET',
                  response: text.substring(0, 200)
                }));
              }).catch(() => {});
            }
            return response;
          })
          .catch(error => {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'fetch_error',
              url: urlString,
              error: error.message
            }));
            throw error;
          });
      };
    }
    
    // Native hazır mesajı ve auth durumu
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'webview_ready',
      timestamp: Date.now(),
      hasAuth: !!(token && refreshToken),
      localStorage: {
        token: token ? 'exists' : 'null',
        refreshToken: refreshToken ? 'exists' : 'null'
      },
      cookies: document.cookie || 'no cookies'
    }));
    
    true;
  })();
`;

// WebView'a inject edilecek CSS
export const injectedCSS = `
  /* iOS Safe Area */
  body {
    padding-top: constant(safe-area-inset-top);
    padding-top: env(safe-area-inset-top);
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
  }
  
  /* Scrollbar gizle */
  ::-webkit-scrollbar {
    display: none;
  }
  
  /* Text selection */
  * {
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }
  
  input, textarea {
    -webkit-user-select: text;
    -webkit-touch-callout: default;
  }
  
  /* Bounce effect kaldır (iOS) */
  body {
    overscroll-behavior: none;
  }
`;