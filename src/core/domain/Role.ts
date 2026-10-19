/** Códigos asignados por el servidor. No requieren una colección de roles. */
export const RoleCodes = {
  User: 'user',
  SuperUser: 'superuser',
} as const;

export type RoleCode = typeof RoleCodes[keyof typeof RoleCodes];
