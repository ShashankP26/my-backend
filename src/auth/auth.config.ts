// src/auth/auth.config.ts
export interface AuthUserConfig {
    idField: string;
    usernameField: string;
    passwordField: string;
    roleField: string;
  }
  
  export const DefaultAuthUserConfig: AuthUserConfig = {
    idField: 'id',
    usernameField: 'username',
    passwordField: 'password',
    roleField: 'role',
  };