'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { getSocketService } from '@/lib/socket';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { useNotificationStore } from '@/stores/useNotificationStore';

interface SocketContextType {
  isConnected: boolean;
  joinCourierRoom: (courierId: string) => void;
  joinCompanyRoom: (companyId: string) => void;
  connect: () => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: React.ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const socketService = getSocketService();
  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);

  // Global kurye modal state
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [newOrderData, setNewOrderData] = useState<any>(null);
  const addNotification = useNotificationStore((s) => s.addNotification);

  // Socket bağlantı durumunu takip et
  const checkConnection = useCallback(() => {
    const connected = socketService?.isSocketConnected() || false;
    setIsConnected(connected);
  }, [socketService]);

  // Bildirim event listener'ı
  useEffect(() => {
    const handleNotification = (event: CustomEvent) => {
      const data = event.detail;
      console.log('Socket bildirim alındı:', data);
      // Bildirimi store'a ekle
      try {
        const orderId = data?.orderId || data?.data?.orderId || data?.data?.order?.id || data?.data?.id;
        const notifType = ((): 'info' | 'success' | 'warning' | 'error' => {
          const t = String(data?.type || '').toUpperCase();
          if (t.includes('ACCEPT') || t.includes('ACCEPTED')) return 'success';
          if (t.includes('CANCEL')) return 'warning';
          if (t.includes('ERROR') || t.includes('FAILED')) return 'error';
          return 'info';
        })();

        const title = data?.title || data?.data?.title || (data?.type ? String(data.type).replaceAll('_', ' ') : 'Bildirim');
        const message = data?.message || data?.data?.message || '';

        const u = userRef.current;
        let actionUrl: string | undefined = undefined;
        if (orderId && u) {
          if (u.role === 'COURIER') actionUrl = `/courier/orders/${orderId}`;
          if (u.role === 'COMPANY') actionUrl = `/company/orders/${orderId}`;
        }
        const ownerKey = u ? `${u.role}:${u.company?.id || u.courier?.id || u.id}` : 'UNKNOWN';
        addNotification({
          title: String(title),
          message: typeof message === 'string' ? message : (() => { try { return JSON.stringify(message); } catch { return String(message); } })(),
          type: notifType,
          actionUrl,
          ownerKey,
        });
      } catch (e) {
        console.warn('Bildirim store\'a eklenemedi:', e);
      }
      // Kurye için tüm sayfalarda yeni sipariş modalını aç
      const u = userRef.current;
      if (u?.role === 'COURIER' && data?.type === 'NEW_ORDER' && data?.data) {
        setNewOrderData(data.data);
        setShowNewOrderModal(true);
      }
    };

    const handleToast = (event: CustomEvent) => {
      const { type, title, message, data } = event.detail;

      const toText = (v: any): string | undefined => {
        if (!v) return undefined;
        if (typeof v === 'string') return v;
        if (typeof v === 'object') {
          const candidate = (v as any).text || (v as any).message || (v as any).title || (v as any).description;
          if (typeof candidate === 'string') return candidate;
        }
        try { return JSON.stringify(v); } catch { return String(v); }
      };

      const safeTitle = toText(title) || 'Bildirim';
      const safeMessage = toText(message) || '';

      // Olası orderId kaynaklarını birleştir
      const orderId = data?.orderId || data?.data?.orderId || data?.data?.order?.id || data?.id;
      const u = userRef.current;
      let viewAction: { label: string; onClick: () => void } | undefined = undefined;

      if (orderId && u) {
        if (u.role === 'COURIER') {
          viewAction = {
            label: 'Görüntüle',
            onClick: () => { window.location.href = `/courier/orders/${orderId}`; },
          };
        } else if (u.role === 'COMPANY') {
          viewAction = {
            label: 'Görüntüle',
            onClick: () => { window.location.href = `/company/orders/${orderId}`; },
          };
        }
      }

      // Sonner toast göster
      toast(safeTitle, {
        description: safeMessage,
        duration: 5000,
        action: viewAction,
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('socket-notification', handleNotification as EventListener);
      window.addEventListener('socket-toast', handleToast as EventListener);

      return () => {
        window.removeEventListener('socket-notification', handleNotification as EventListener);
        window.removeEventListener('socket-toast', handleToast as EventListener);
      };
    }
  }, []);

  // Kullanıcı giriş yaptığında bağlan
  useEffect(() => {
    console.log('SocketContext useEffect tetiklendi:', { isAuthenticated, user, socketService: !!socketService });
    
    if (isAuthenticated && user && socketService) {
      console.log('WebSocket bağlantısı kuruluyor...', { userRole: user.role, userId: user.id });
      socketService.connect();
      
      // Bağlantı durumunu kontrol et
      const interval = setInterval(() => {
        const connected = socketService?.isSocketConnected() || false;
        console.log('Bağlantı durumu kontrol ediliyor:', connected);
        setIsConnected(connected);
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    } else {
      console.log('WebSocket bağlantısı kurulmuyor çünkü:', { 
        isAuthenticated, 
        hasUser: !!user, 
        hasSocketService: !!socketService 
      });
    }
  }, [isAuthenticated, user, socketService]);

  // Bağlantı kurulunca uygun odaya katıl; kullanıcı değişirse yeniden katıl
  const lastJoinKeyRef = useRef<string | null>(null);
  useEffect(() => {
    if (!isConnected || !user || !socketService) return;
    const key = user.role === 'COURIER' && user.courier?.id
      ? `courier-${user.courier.id}`
      : user.role === 'COMPANY' && user.company?.id
      ? `company-${user.company.id}`
      : null;
    if (!key) return;

    if (lastJoinKeyRef.current !== key) {
      lastJoinKeyRef.current = key;
      if (key.startsWith('courier-')) {
        console.log('Courier room katılıyor (yeniden/ilk):', user.courier?.id);
        socketService.joinCourierRoom(user.courier!.id as any);
      } else if (key.startsWith('company-')) {
        console.log('Company room katılıyor (yeniden/ilk):', user.company?.id);
        socketService.joinCompanyRoom(user.company!.id as any);
      }
    }
  }, [isConnected, user, socketService]);

  // Kullanıcı çıkış yaptığında bağlantıyı kes
  useEffect(() => {
    if (!isAuthenticated && socketService) {
      console.log('Kullanıcı çıkış yapmış, WebSocket bağlantısı kesiliyor...');
      socketService.disconnect();
      setIsConnected(false);
    }
  }, [isAuthenticated, socketService]);

  // Component unmount olduğunda cleanup
  useEffect(() => {
    return () => {
      if (socketService) {
        socketService.disconnect();
      }
    };
  }, [socketService]);

  const connect = useCallback(() => {
    if (socketService && isAuthenticated) {
      socketService.connect();
    }
  }, [socketService, isAuthenticated]);

  const disconnect = useCallback(() => {
    if (socketService) {
      socketService.disconnect();
      setIsConnected(false);
    }
  }, [socketService]);

  const joinCourierRoom = useCallback((courierId: string) => {
    if (socketService && isConnected) {
      socketService.joinCourierRoom(courierId);
    }
  }, [socketService, isConnected]);

  const joinCompanyRoom = useCallback((companyId: string) => {
    if (socketService && isConnected) {
      socketService.joinCompanyRoom(companyId);
    }
  }, [socketService, isConnected]);

  const contextValue: SocketContextType = {
    isConnected,
    joinCourierRoom,
    joinCompanyRoom,
    connect,
    disconnect,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
      {/* Kurye için global yeni sipariş modalı */}
      {showNewOrderModal && (
        <GlobalOrderModal 
          isOpen={showNewOrderModal}
          orderData={newOrderData}
          onClose={() => { setShowNewOrderModal(false); setNewOrderData(null); }}
        />
      )}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

import { OrderNotificationModal } from '@/components/courier/OrderNotificationModal';

function GlobalOrderModal({ isOpen, onClose, orderData }: { isOpen: boolean; onClose: () => void; orderData: any }) {
  if (!isOpen || !orderData) return null;
  return (
    <OrderNotificationModal
      isOpen={isOpen}
      onClose={onClose}
      orderData={orderData}
      onAccept={() => {}}
      onReject={() => {}}
    />
  );
}
