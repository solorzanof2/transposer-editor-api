/** Identidad firmada del login actual; migrar a sub estable en otra iteración. */
export interface PrincipalUserDTO {
  email: string;
  sub?: string;
  iat?: number;
  exp?: number;
}
