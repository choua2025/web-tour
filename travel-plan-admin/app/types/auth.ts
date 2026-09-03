import type { User } from './user'

export interface AuthResponse {
    token: string
    user: User
    message?: string
}

export interface LoginCredentials {
    email: string
    password?: string
}
