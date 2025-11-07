export type Rol = 'ADMIN' | 'USUARIO';

export interface IUser {
    id: number;
    nombre: string;
    apellido: string;
    celular?: string;
    email: string;
    password: string;
    rol: Rol;
}