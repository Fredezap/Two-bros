// Rutas de API para entidades principales
export const API_ROUTES = {
  INGREDIENTS: '/ingredients',
  RECIPES: '/recipes',
  BREWS: '/brews',
  STYLES: '/styles',
};

export const ROUTES = {
  HOME: '/',
  AVAILABLE: '/available',
  BREWS: '/brews',
  INGREDIENTS: '/ingredients',
  STYLES: '/styles',
  RECIPE_FORM: '/recipe/:id?', // optional id
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',
  VERIFY_EMAIL: '/verify-email/:token',
  PROFILE: '/profile',

  // Rutas de usuario (API)
  USERS: '/users',
  USERS_REGISTER: '/users/register',
  USERS_LOGIN: '/users/login',
  USERS_VERIFY_EMAIL: '/users/verify-email',
  USERS_FORGOT_PASSWORD: '/users/forgot-password',
  USERS_RESET_PASSWORD: '/users/reset-password',
  USERS_RESEND_VERIFICATION: '/users/resend-verification',
  USERS_CHANGE_PASSWORD: '/users/change-password',
  USERS_ME: '/users/me',
  USERS_LOGOUT: '/users/logout',
  USERS_UNLOCK_ACCOUNT: '/users/unlock-account',
  UNLOCK_ACCOUNT_REQUEST: '/unlock-account-request',
} as const

export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
  ROUTES.VERIFY_EMAIL.replace(':token', ''),
  ROUTES.USERS_UNLOCK_ACCOUNT,
  ROUTES.USERS_FORGOT_PASSWORD
];

export default ROUTES
