/**
 * Ana WebView container komponenti
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  RefreshControl,
  ScrollView,
  BackHandler,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import {
  WebViewErrorEvent,
  WebViewNavigationEvent,
  WebViewProgressEvent,
} from 'react-native-webview/lib/WebViewTypes';
import { LoadingScreen } from './LoadingScreen';
import { NoConnection } from './NoConnection';
import { useWebViewBridge } from '../hooks/useWebViewBridge';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { 
  WEB_URL, 
  APP_CONFIG, 
  IS_ANDROID 
} from '../config/constants';
import { 
  webViewConfig, 
  injectedJavaScript,
  injectedCSS 
} from '../config/webview.config';

export const WebViewContainer: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  
  const { isConnected, checkConnection } = useNetworkStatus();
  const {
    webViewRef,
    handleMessage,
    postMessage,
    goBack,
    reload,
  } = useWebViewBridge({
    onMessage: (message) => {
      console.log('WebView mesaj:', message);
      // Mesajları işle
      handleWebViewMessage(message);
    },
  });

  // Android back button handler
  useEffect(() => {
    if (!IS_ANDROID) return;
    
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (canGoBack && webViewRef.current) {
          goBack();
          return true;
        }
        
        // Uygulamadan çıkış onayı
        Alert.alert(
          'Çıkmak istiyor musunuz?',
          'Uygulamadan çıkmak üzeresiniz',
          [
            { text: 'İptal', style: 'cancel' },
            { text: 'Çık', onPress: () => BackHandler.exitApp() }
          ]
        );
        return true;
      }
    );

    return () => backHandler.remove();
  }, [canGoBack, goBack]);

  // WebView'dan gelen mesajları işle
  const handleWebViewMessage = (message: any) => {
    switch (message.type) {
      case 'navigation':
        // Navigasyon mesajları
        break;
      case 'auth':
        // Auth mesajları
        break;
      case 'notification':
        // Bildirim mesajları
        break;
      default:
        break;
    }
  };

  // WebView yükleme başladığında
  const onLoadStart = useCallback((event: WebViewNavigationEvent) => {
    setIsLoading(true);
    setError(null);
    setCanGoBack(event.nativeEvent.canGoBack);
  }, []);

  // WebView yükleme tamamlandığında
  const onLoadEnd = useCallback((event: WebViewNavigationEvent) => {
    setIsLoading(false);
    setIsRefreshing(false);
    setCanGoBack(event.nativeEvent.canGoBack);
    
    // CSS inject et
    const cssScript = `
      (function() {
        const style = document.createElement('style');
        style.textContent = \`${injectedCSS}\`;
        document.head.appendChild(style);
      })();
      true;
    `;
    webViewRef.current?.injectJavaScript(cssScript);
  }, []);

  // WebView hata durumu
  const onError = useCallback((event: WebViewErrorEvent) => {
    setIsLoading(false);
    setIsRefreshing(false);
    setError(event.nativeEvent.description);
    console.error('WebView hatası:', event.nativeEvent);
  }, []);

  // Progress güncellemesi
  const onLoadProgress = useCallback((event: WebViewProgressEvent) => {
    setProgress(event.nativeEvent.progress);
    setCanGoBack(event.nativeEvent.canGoBack);
  }, []);

  // Http hatası (Android API 23+)
  const onHttpError = useCallback((event: any) => {
    const { nativeEvent } = event;
    if (nativeEvent.statusCode >= 400) {
      console.error(`HTTP Hatası: ${nativeEvent.statusCode} - ${nativeEvent.url}`);
    }
  }, []);

  // Yenile fonksiyonu
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    const connected = await checkConnection();
    
    if (connected) {
      reload();
    } else {
      setIsRefreshing(false);
      setError('İnternet bağlantısı yok');
    }
  }, [checkConnection, reload]);

  // Retry fonksiyonu
  const handleRetry = useCallback(async () => {
    const connected = await checkConnection();
    if (connected) {
      setError(null);
      reload();
    }
  }, [checkConnection, reload]);

  // Should start load with request
  const onShouldStartLoadWithRequest = useCallback((request: any) => {
    const { url } = request;
    
    // Tel linkleri
    if (url.startsWith('tel:')) {
      // Native telefon uygulamasını aç
      return false;
    }
    
    // Mail linkleri
    if (url.startsWith('mailto:')) {
      // Native mail uygulamasını aç
      return false;
    }
    
    // WhatsApp linkleri
    if (url.startsWith('whatsapp:')) {
      // WhatsApp'ı aç
      return false;
    }
    
    return true;
  }, []);

  // Bağlantı yoksa
  if (!isConnected && !error) {
    return <NoConnection onRetry={handleRetry} />;
  }

  // Hata durumu
  if (error && !isLoading) {
    return <NoConnection onRetry={handleRetry} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#FFFFFF"
      />
      
      {/* Progress bar */}
      {isLoading && progress < 0.99 && (
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${progress * 100}%` }
            ]} 
          />
        </View>
      )}
      
      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: WEB_URL }}
        style={styles.webView}
        
        // Konfigürasyonlar
        {...webViewConfig}
        
        // Event handlers
        onLoadStart={onLoadStart}
        onLoadEnd={onLoadEnd}
        onLoadProgress={onLoadProgress}
        onError={onError}
        onHttpError={onHttpError}
        onMessage={handleMessage}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        
        // JavaScript injection
        injectedJavaScript={injectedJavaScript}
        injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
        
        // Pull to refresh (iOS)
        pullToRefreshEnabled={Platform.OS === 'ios'}
        onRefresh={handleRefresh}
        refreshControl={
          Platform.OS === 'android' ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#3B82F6']}
            />
          ) : undefined
        }
        
        // Diğer özellikler
        startInLoadingState={true}
        renderLoading={() => <LoadingScreen />}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        overScrollMode="never"
        bounces={false}
      />
      
      {/* Loading overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <LoadingScreen />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webView: {
    flex: 1,
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#E5E7EB',
    zIndex: 1000,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 999,
  },
});