import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
  ownerKey: string; // 'COMPANY:123' | 'COURIER:456' | 'SUPER_ADMIN:...'
}

interface NotificationState {
  // State
  notifications: Notification[];
  isOpen: boolean;

  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: (ownerKey: string) => void;
  removeNotification: (notificationId: string) => void;
  clearAll: () => void;
  togglePanel: () => void;
  setOpen: (isOpen: boolean) => void;
  // Selectors
  getNotifications: (ownerKey: string) => Notification[];
  getUnreadCount: (ownerKey: string) => number;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    devtools(
      immer((set, get) => ({
        // Initial State
        notifications: [],
        isOpen: false,

        // Actions
        addNotification: (notification) =>
          set((state) => {
            const newNotification: Notification = {
              ...notification,
              id: Date.now().toString(),
              read: false,
              createdAt: new Date(),
            };
            // Aynı ownerKey + aynı title + yakın zamanlı aynı mesajı tekrar eklemeyi engelle (son 5 kayıt içinde)
            const recent = state.notifications.slice(0, 5);
            const duplicate = recent.find(
              (n) => n.ownerKey === (newNotification as any).ownerKey && n.title === newNotification.title && n.message === newNotification.message
            );
            if (!duplicate) {
              state.notifications.unshift(newNotification);
            }

            // Maksimum 200 bildirim tut
            if (state.notifications.length > 200) {
              state.notifications = state.notifications.slice(0, 200);
            }
          }),

        markAsRead: (notificationId) =>
          set((state) => {
            const notification = state.notifications.find(n => n.id === notificationId);
            if (notification && !notification.read) {
              notification.read = true;
            }
          }),

        markAllAsRead: (ownerKey: string) =>
          set((state) => {
            state.notifications.forEach(n => {
              if (n.ownerKey === ownerKey) n.read = true;
            });
          }),

        removeNotification: (notificationId) =>
          set((state) => {
            const index = state.notifications.findIndex(n => n.id === notificationId);
            if (index !== -1) {
              state.notifications.splice(index, 1);
            }
          }),

        clearAll: () =>
          set((state) => {
            state.notifications = [];
          }),

        togglePanel: () =>
          set((state) => {
            state.isOpen = !state.isOpen;
          }),

        setOpen: (isOpen) =>
          set((state) => {
            state.isOpen = isOpen;
          }),

        // Selectors
        getNotifications: (ownerKey: string) => {
          return get().notifications.filter(n => n.ownerKey === ownerKey);
        },
        getUnreadCount: (ownerKey: string) => {
          return get().notifications.filter(n => n.ownerKey === ownerKey && !n.read).length;
        },
      }))
    ),
    {
      name: 'notification-store-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ notifications: state.notifications }),
    }
  )
);
