export const ROLES = { ADMIN: 'admin', ANALYST: 'analyst', USER: 'user' };

export const ROLE_LABELS = {
  admin:   'ADMIN',
  analyst: 'ANALISTA',
  user:    'USUÁRIO',
};

export const ROLE_COLORS = {
  admin:   '#E0A85A',
  analyst: '#4A9FE0',
  user:    '#8FBAD8',
};

const PERMISSIONS = {
  admin:   ['view_dashboard', 'view_analytics', 'register_vehicle', 'view_fidelidade'],
  analyst: ['view_dashboard', 'view_analytics', 'register_vehicle', 'view_fidelidade'],
  user:    ['register_vehicle', 'view_fidelidade'],
};

export const hasPermission = (role, action) =>
  (PERMISSIONS[role] || PERMISSIONS.user).includes(action);

// Role is derived from email at login time — no manual assignment needed
export const assignRole = (email) => {
  if (!email) return ROLES.USER;
  if (email === 'a') return ROLES.ADMIN;
  if (email.toLowerCase().endsWith('@ford.com')) return ROLES.ANALYST;
  return ROLES.USER;
};
