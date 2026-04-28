// Rutas de API para entidades principales
export const API_ROUTES = {
  INGREDIENTS: '/api/ingredients',
  RECIPES: '/api/recipes',
  BREWS: '/api/brews',
  STYLES: '/api/styles',
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
  USERS: '/api/users',
  USERS_REGISTER: '/api/users/register',
  USERS_LOGIN: '/api/users/login',
  USERS_VERIFY_EMAIL: '/api/users/verify-email',
  USERS_FORGOT_PASSWORD: '/api/users/forgot-password',
  USERS_RESET_PASSWORD: '/api/users/reset-password',
  USERS_RESEND_VERIFICATION: '/api/users/resend-verification',
  USERS_CHANGE_PASSWORD: '/api/users/change-password',
  USERS_ME: '/api/users/me',
  USERS_LOGOUT: '/api/users/logout',
  USERS_UNLOCK_ACCOUNT: '/api/users/unlock-account',
  UNLOCK_ACCOUNT_REQUEST: '/api/unlock-account-request',
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
