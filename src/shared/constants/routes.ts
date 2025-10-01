export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  RECOVER_PASSWORD: '/recover',
  RESET_PASSWORD: '/reset-password/:uidb64/:token',
  DASHBOARD: '/home',
  PROFILE: '/profile',

  // Editorial Numbers
  EDITORIAL_NUMBERS: '/editorial-numbers',
  CREATE_EDITORIAL_NUMBER: '/editorial-numbers/create',
  EDIT_EDITORIAL_NUMBER: '/editorial-numbers/:id/edit',
  MODIFY_EDITORIAL_NUMBER: '/editorial-numbers/modify',

  // Researchers
  RESEARCHERS: '/researchers',
  CREATE_RESEARCHER: '/researchers/create',
  MODIFY_RESEARCHER: '/researchers/modify',
  EDIT_RESEARCHER: '/researchers/:id/edit',

  // Articles
  ARTICLES: '/articles',
  CREATE_ARTICLE: '/articles/create',
  EDIT_ARTICLE: '/articles/:id/edit',

  // Reports
  REPORTS: '/reports',

  // Thematic Lines
  CREATE_THEMATIC_LINE: '/thematic-lines/create',
  MODIFY_THEMATIC_LINE: '/thematic-lines/modify',
  DEACTIVATE_THEMATIC_LINE: '/thematic-lines/deactivate',

  // Admin
  ADMIN: '/admin',
  USER_MANAGEMENT: '/admin/users',
  MANAGE_USERS: '/manage-users',

  // Build/Development
  BUILD: '/build',
} as const;

export type RouteType = typeof ROUTES[keyof typeof ROUTES];