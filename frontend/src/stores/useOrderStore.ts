import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Order } from '@/services/order.service';

interface OrderFilters {
  status?: string;
  companyId?: string;
  courierId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

interface OrderState {
  // State
  orders: Order[];
  selectedOrder: Order | null;
  filters: OrderFilters;
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  pageSize: number;

  // Actions
  setOrders: (orders: Order[], total: number) => void;
  setSelectedOrder: (order: Order | null) => void;
  addOrder: (order: Order) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  removeOrder: (orderId: string) => void;
  setFilters: (filters: OrderFilters) => void;
  resetFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

export const useOrderStore = create<OrderState>()(
  devtools(
    immer((set) => ({
      // Initial State
      orders: [],
      selectedOrder: null,
      filters: {},
      loading: false,
      error: null,
      totalCount: 0,
      currentPage: 1,
      pageSize: 10,

      // Actions
      setOrders: (orders, total) =>
        set((state) => {
          state.orders = orders;
          state.totalCount = total;
          state.error = null;
        }),

      setSelectedOrder: (order) =>
        set((state) => {
          state.selectedOrder = order;
        }),

      addOrder: (order) =>
        set((state) => {
          state.orders.unshift(order);
          state.totalCount += 1;
        }),

      updateOrder: (orderId, updates) =>
        set((state) => {
          const index = state.orders.findIndex(o => o.id === orderId);
          if (index !== -1) {
            Object.assign(state.orders[index], updates);
          }
          if (state.selectedOrder?.id === orderId) {
            Object.assign(state.selectedOrder, updates);
          }
        }),

      removeOrder: (orderId) =>
        set((state) => {
          state.orders = state.orders.filter(o => o.id !== orderId);
          state.totalCount -= 1;
          if (state.selectedOrder?.id === orderId) {
            state.selectedOrder = null;
          }
        }),

      setFilters: (filters) =>
        set((state) => {
          state.filters = { ...state.filters, ...filters };
          state.currentPage = 1; // Filtre değiştiğinde ilk sayfaya dön
        }),

      resetFilters: () =>
        set((state) => {
          state.filters = {};
          state.currentPage = 1;
        }),

      setLoading: (loading) =>
        set((state) => {
          state.loading = loading;
        }),

      setError: (error) =>
        set((state) => {
          state.error = error;
          state.loading = false;
        }),

      setCurrentPage: (page) =>
        set((state) => {
          state.currentPage = page;
        }),

      setPageSize: (size) =>
        set((state) => {
          state.pageSize = size;
          state.currentPage = 1; // Sayfa boyutu değiştiğinde ilk sayfaya dön
        }),
    })),
    {
      name: 'order-store',
    }
  )
);