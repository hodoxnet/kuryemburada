import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

interface NotificationState {
  // State
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;

  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAll: () => void;
  togglePanel: () => void;
  setOpen: (isOpen: boolean) => void;
}

export const useNotificationStore = create<NotificationState>()(
  devtools(
    immer((set) => ({
      // Initial State
      notifications: [],
      unreadCount: 0,
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
          
          state.notifications.unshift(newNotification);
          state.unreadCount += 1;

          // Maksimum 50 bildirim tut
          if (state.notifications.length > 50) {
            state.notifications = state.notifications.slice(0, 50);
          }
        }),

      markAsRead: (notificationId) =>
        set((state) => {
          const notification = state.notifications.find(n => n.id === notificationId);
          if (notification && !notification.read) {
            notification.read = true;
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }),

      markAllAsRead: () =>
        set((state) => {
          state.notifications.forEach(n => {
            n.read = true;
          });
          state.unreadCount = 0;
        }),

      removeNotification: (notificationId) =>
        set((state) => {
          const index = state.notifications.findIndex(n => n.id === notificationId);
          if (index !== -1) {
            const notification = state.notifications[index];
            if (!notification.read) {
              state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
            state.notifications.splice(index, 1);
          }
        }),

      clearAll: () =>
        set((state) => {
          state.notifications = [];
          state.unreadCount = 0;
        }),

      togglePanel: () =>
        set((state) => {
          state.isOpen = !state.isOpen;
        }),

      setOpen: (isOpen) =>
        set((state) => {
          state.isOpen = isOpen;
        }),
    })),
    {
      name: 'notification-store',
    }
  )
);