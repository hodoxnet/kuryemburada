/**
 * WebView ile native arasında iletişim sağlayan hook
 */

import { useRef, useCallback } from 'react';
import { WebView } from 'react-native-webview';
import { WebViewMessageEvent } from 'react-native-webview/lib/WebViewTypes';

export interface WebViewMessage {
  type: string;
  data?: any;
  timestamp?: number;
}

interface UseWebViewBridgeProps {
  onMessage?: (message: WebViewMessage) => void;
  onConsoleLog?: (message: string) => void;
}

export const useWebViewBridge = ({ 
  onMessage, 
  onConsoleLog 
}: UseWebViewBridgeProps = {}) => {
  const webViewRef = useRef<WebView>(null);

  // WebView'dan gelen mesajları işle
  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const message: WebViewMessage = JSON.parse(event.nativeEvent.data);
      
      // Console log'ları ayır
      if (message.type === 'console') {
        const logData = message as any;
        if (logData.level === 'log' && onConsoleLog) {
          onConsoleLog(logData.message);
        }
        console.log('[WebView]:', logData.message);
        return;
      }
      
      // WebView hazır mesajı
      if (message.type === 'webview_ready') {
        console.log('WebView hazır:', new Date(message.timestamp!).toLocaleTimeString());
        return;
      }
      
      // Diğer mesajları callback'e gönder
      if (onMessage) {
        onMessage(message);
      }
    } catch (error) {
      console.error('WebView mesajı parse edilemedi:', error);
    }
  }, [onMessage, onConsoleLog]);

  // WebView'a mesaj gönder
  const postMessage = useCallback((message: WebViewMessage) => {
    const messageString = JSON.stringify(message);
    const script = `
      (function() {
        try {
          if (window.receiveFromNative) {
            window.receiveFromNative(${messageString});
          }
        } catch (e) {
          console.error('Native mesaj alınamadı:', e);
        }
      })();
      true;
    `;
    
    webViewRef.current?.injectJavaScript(script);
  }, []);

  // JavaScript kodu çalıştır
  const runJavaScript = useCallback((script: string) => {
    const wrappedScript = `
      (function() {
        try {
          ${script}
        } catch (e) {
          console.error('Script hatası:', e);
        }
      })();
      true;
    `;
    
    webViewRef.current?.injectJavaScript(wrappedScript);
  }, []);

  // WebView navigasyon kontrolleri
  const goBack = useCallback(() => {
    webViewRef.current?.goBack();
  }, []);

  const goForward = useCallback(() => {
    webViewRef.current?.goForward();
  }, []);

  const reload = useCallback(() => {
    webViewRef.current?.reload();
  }, []);

  const stopLoading = useCallback(() => {
    webViewRef.current?.stopLoading();
  }, []);

  return {
    webViewRef,
    handleMessage,
    postMessage,
    runJavaScript,
    goBack,
    goForward,
    reload,
    stopLoading,
  };
};