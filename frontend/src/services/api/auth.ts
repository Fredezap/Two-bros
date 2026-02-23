import axios from '../../api/axios';
import type {
	LoginData,
	RegisterData,
	ForgotPasswordData,
	ResetPasswordData,
	VerifyEmailData,
} from '../../types';

import ROUTES from '../../stores/routes';

export const register = (data: RegisterData) => axios.post(ROUTES.USERS_REGISTER, data);
export const login = (data: LoginData) => axios.post(ROUTES.USERS_LOGIN, data);
export const verifyEmail = (data: VerifyEmailData) => axios.post(ROUTES.USERS_VERIFY_EMAIL, data);
export const forgotPassword = (data: ForgotPasswordData) => axios.post(ROUTES.USERS_FORGOT_PASSWORD, data);
export const resetPassword = (data: ResetPasswordData) => axios.post(ROUTES.USERS_RESET_PASSWORD, data);
export const resendVerification = (data: { email: string }) => axios.post(ROUTES.USERS_RESEND_VERIFICATION, data);
export const changePassword = (data: { oldPassword: string; newPassword: string }, token: string) => axios.post(ROUTES.USERS_CHANGE_PASSWORD, data, { headers: { Authorization: `Bearer ${token}` } });
export const getProfile = () => {
	// Solo llamar si hay cookie/token (ejemplo simple, puedes mejorar)
	if (typeof document !== 'undefined' && document.cookie && document.cookie.includes('token')) {
		return axios.get(ROUTES.USERS_ME);
	}
	return Promise.reject(new Error('No hay sesión activa'));
};
export const logout = () => axios.post(ROUTES.USERS_LOGOUT);


// todo: Login social (Google/Facebook)
// todo: 2FA
// todo: Migrar token a cookies httpOnly para máxima seguridad