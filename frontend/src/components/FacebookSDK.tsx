'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

export function FacebookSDK() {
  useEffect(() => {
    // Facebook SDK'yı yükle
    const loadFacebookSDK = () => {
      // Zaten yüklüyse tekrar yükleme
      if (window.FB) {
        return;
      }

      // fbAsyncInit fonksiyonunu tanımla
      window.fbAsyncInit = function () {
        window.FB.init({
          appId: process.env.NEXT_PUBLIC_META_APP_ID || '',
          cookie: true,
          xfbml: true,
          version: 'v18.0',
        });

        console.log('Facebook SDK initialized');
      };

      // SDK script'ini yükle
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/tr_TR/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';

      // Script'i head'e ekle
      const firstScript = document.getElementsByTagName('script')[0];
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      } else {
        document.head.appendChild(script);
      }
    };

    loadFacebookSDK();
  }, []);

  return null;
}
