export interface User {
    id: string | number
    name: string
    email: string
    password?: string
    phone?: string
    role: 'user' | 'admin'
    created_at?: string
}
