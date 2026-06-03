import { create } from 'zustand';
import { User } from '@/types';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isLoading: true,

  login: async (email: string, password: string) => {
    try {
      const data = await authApi.login({ email, password });
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token });
      toast.success('登录成功！');
    } catch (error: any) {
      toast.error(error.response?.data?.message || '登录失败');
      throw error;
    }
  },

  register: async (username: string, email: string, password: string) => {
    try {
      const data = await authApi.register({ username, email, password });
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token });
      toast.success('注册成功！');
    } catch (error: any) {
      toast.error(error.response?.data?.message || '注册失败');
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
    toast.success('已退出登录');
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isLoading: false, user: null, token: null });
      return;
    }
    try {
      const user = await authApi.me();
      set({ user, token, isLoading: false });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null, isLoading: false });
    }
  },
}));
