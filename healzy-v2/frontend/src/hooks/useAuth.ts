'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import type { LoginDto, RegisterDto } from '@/types/user';
import toast from 'react-hot-toast';

export function useAuth() {
  const router = useRouter();
  const { user, tokens, isAuthenticated, isLoading, login, logout, setLoading, updateUser } = useAuthStore();

  const handleLogin = useCallback(async (dto: LoginDto) => {
    setLoading(true);
    try {
      const data = await authService.login(dto);
      login(data.user, data.tokens);
      toast.success('Welcome back!');
      const redirect = new URLSearchParams(window.location.search).get('redirect') || '/dashboard/' + data.user.role;
      router.push(redirect);
      return data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid email or password.';
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [login, router, setLoading]);

  const handleRegister = useCallback(async (dto: RegisterDto) => {
    setLoading(true);
    try {
      const data = await authService.register(dto);
      login(data.user, data.tokens);
      toast.success('Account created! Welcome to Healzy.');
      router.push('/dashboard/' + data.user.role);
      return data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [login, router, setLoading]);

  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    logout();
    router.push('/');
    toast.success('Logged out successfully.');
  }, [logout, router]);

  const handleGoogleLogin = useCallback(async (idToken: string) => {
    setLoading(true);
    try {
      const data = await authService.googleLogin(idToken);
      login(data.user, data.tokens);
      toast.success('Welcome!');
      router.push('/dashboard/' + data.user.role);
      return data;
    } catch (err: any) {
      toast.error('Google login failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [login, router, setLoading]);

  return {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    isPatient: user?.role === 'patient',
    isDoctor: user?.role === 'doctor',
    isAdmin: user?.role === 'admin',
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    googleLogin: handleGoogleLogin,
    updateUser,
  };
}
