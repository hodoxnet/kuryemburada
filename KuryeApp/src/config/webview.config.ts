/**
 * WebView konfigürasyonları
 */

import { WebViewProps } from 'react-native-webview';
import { IS_ANDROID, IS_IOS } from './constants';

export const webViewConfig: Partial<WebViewProps> = {
  // JavaScript ve Storage
  javaScriptEnabled: true,
  domStorageEnabled: true,
  
  // Cache ve Cookie
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
    saveFormDataDisabled: true,
    forceDarkOn: false,
    minimumFontSize: 1,
  }),
};

// Injected JavaScript - WebView algılama
export const injectedJavaScript = `
  (function() {
    // WebView'da olduğumuzu belirt
    window.isNativeApp = true;
    window.isWebView = true;
    window.platform = '${IS_IOS ? 'ios' : 'android'}';
    
    // Console log'ları native'e gönder (debug için)
    if (${__DEV__}) {
      const originalLog = console.log;
      console.log = function(...args) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'console',
          level: 'log',
          message: args.join(' ')
        }));
        originalLog.apply(console, args);
      };
    }
    
    // Native hazır mesajı
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'webview_ready',
      timestamp: Date.now()
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