export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  RECOVER_PASSWORD: '/recover',
  DASHBOARD: '/home',
  PROFILE: '/profile',

  // Editorial Numbers
  EDITORIAL_NUMBERS: '/editorial-numbers',
  CREATE_EDITORIAL_NUMBER: '/editorial-numbers/create',
  EDIT_EDITORIAL_NUMBER: '/editorial-numbers/:id/edit',

  // Researchers
  RESEARCHERS: '/researchers',
  CREATE_RESEARCHER: '/researchers/create',
  EDIT_RESEARCHER: '/researchers/:id/edit',

  // Articles
  ARTICLES: '/articles',
  CREATE_ARTICLE: '/articles/create',
  EDIT_ARTICLE: '/articles/:id/edit',

  // Reports
  REPORTS: '/reports',

  // Admin
  ADMIN: '/admin',
  USER_MANAGEMENT: '/admin/users',

  // Build/Development
  BUILD: '/build',
} as const;

export type RouteType = typeof ROUTES[keyof typeof ROUTES];