/**
 * İnternet bağlantı durumunu takip eden hook
 */

import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: null,
    type: 'unknown',
  });

  useEffect(() => {
    // İlk durum kontrolü
    NetInfo.fetch().then(handleNetworkChange);

    // Listener ekle
    const unsubscribe = NetInfo.addEventListener(handleNetworkChange);

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, []);

  const handleNetworkChange = (state: NetInfoState) => {
    setNetworkStatus({
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
    });
  };

  // Yeniden kontrol fonksiyonu
  const checkConnection = async (): Promise<boolean> => {
    const state = await NetInfo.fetch();
    handleNetworkChange(state);
    return state.isConnected ?? false;
  };

  return {
    ...networkStatus,
    checkConnection,
  };
};