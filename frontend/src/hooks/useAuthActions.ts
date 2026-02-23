import { useAuth } from '../contexts/AuthContext';
import { useCallback } from 'react';
import * as authApi from '../services/api/auth';
import type {
  LoginData,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
  VerifyEmailData,
} from '../types';

export function useLogin() {
  const { login } = useAuth();
  return login as (data: LoginData) => Promise<any>;
}

export function useLogout() {
  const { logout } = useAuth();
  return logout;
}

export function useRegister() {
  return useCallback(async (data: RegisterData) => {
    return await authApi.register(data);
  }, []);
}

export function useForgotPassword() {
  return useCallback(async (data: ForgotPasswordData) => {
    return await authApi.forgotPassword(data);
  }, []);
}

export function useResetPassword() {
  return useCallback(async (data: ResetPasswordData) => {
    return await authApi.resetPassword(data);
  }, []);
}

export function useVerifyEmail() {
  return useCallback(async (data: VerifyEmailData) => {
    return await authApi.verifyEmail(data);
  }, []);
}
