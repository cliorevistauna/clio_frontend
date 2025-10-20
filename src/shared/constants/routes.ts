export const ROUTES = {
  HOME: '/',
  LOGIN: '/iniciar-sesión',
  REGISTER: '/registrarse',
  RECOVER_PASSWORD: '/recuperar-contraseña',
  RESET_PASSWORD: '/reset-password/:uidb64/:token',
  DASHBOARD: '/home',
  PROFILE: '/mi-perfil',

  // Editorial Numbers
  EDITORIAL_NUMBERS: '/editorial-numbers',
  CREATE_EDITORIAL_NUMBER: '/número-de-publicación/registrar',
  EDIT_EDITORIAL_NUMBER: '/editorial-numbers/:id/edit',
  MODIFY_EDITORIAL_NUMBER: '/número-de-publicación/modificar',

  // Researchers
  RESEARCHERS: '/researchers',
  CREATE_RESEARCHER: '/autores_evaluadores/registrar',
  MODIFY_RESEARCHER: '/autores_evaluadores/actualizar',
  EDIT_RESEARCHER: '/researchers/:id/edit',

  // Articles
  ARTICLES: '/articles',
  CREATE_ARTICLE: '/artículos/registrar',
  MODIFY_ARTICLE: '/artículos/actualizar',
  EDIT_ARTICLE: '/articles/:id/edit',

  // Reports
  REPORTS: '/reports',
  EVALUATOR_HISTORY_REPORT: '/reportes/histórico-de-evaluaciones-por-evaluador',
  EVALUATORS_BY_THEME_REPORT: '/reportes/estadísticas-de-evaluadores-por-línea-temática',
  EVALUATOR_WORKLOAD_REPORT: '/reportes/carga-de-trabajo-de-evaluadores',
  INVITATIONS_BY_ISSUE_REPORT: '/reportes/invitaciones-por-número-de-publicación',
  PARTICIPATION_BY_ARTICLE_REPORT: '/reportes/participación-por-artículo',
  PREVIOUS_PARTICIPATION_REPORT: '/reportes/participación-en-números-anteriores',

  // Thematic Lines
  CREATE_THEMATIC_LINE: '/línea-temática/registrar',
  MODIFY_THEMATIC_LINE: '/línea-temática/modificar',
  DEACTIVATE_THEMATIC_LINE: '/línea-temática/eliminar',

  // Languages
  CREATE_LANGUAGE: '/idioma/registrar',
  MODIFY_LANGUAGE: '/idioma/modificar',
  DEACTIVATE_LANGUAGE: '/idioma/eliminar',

  // Admin
  ADMIN: '/admin',
  USER_MANAGEMENT: '/admin/users',
  MANAGE_USERS: '/gestionar-usuarios',

  // Build/Development
  BUILD: '/build',
} as const;

export type RouteType = typeof ROUTES[keyof typeof ROUTES];