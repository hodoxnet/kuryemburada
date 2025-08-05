import { useAuthStore } from '../store/auth.store';

export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  } = useAuthStore();

  const hasRole = (role: string | string[]): boolean => {
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  };

  const isSuperAdmin = (): boolean => hasRole('SUPER_ADMIN');
  const isCompany = (): boolean => hasRole('COMPANY');
  const isCourier = (): boolean => hasRole('COURIER');

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
    hasRole,
    isSuperAdmin,
    isCompany,
    isCourier,
  };
}