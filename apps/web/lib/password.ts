import bcrypt from "bcryptjs";

export const USERNAME_RE = /^[a-zA-Z0-9._-]{3,32}$/;
export const MIN_PASSWORD_LENGTH = 8;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Valida usuario y contraseña; devuelve un mensaje de error o null. */
export function validateCredentials(username: string, password: string): string | null {
  if (!USERNAME_RE.test(username)) {
    return "El usuario debe tener 3-32 caracteres (letras, números, . _ -).";
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  return null;
}
