/** El subject del JWT identifica el _id del usuario en MongoDB. */
export interface PrincipalUserDTO {
  sub: string;
  iat?: number;
  exp?: number;
}
