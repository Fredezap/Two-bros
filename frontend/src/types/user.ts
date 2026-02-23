// Este tipo refleja el payload JWT devuelto por /users/me
export interface User {
  sub: string; // id
  email: string;
}
