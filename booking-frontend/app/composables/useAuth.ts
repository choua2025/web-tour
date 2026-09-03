import { useApi } from './useApi'

export const useAuth = () => {
    const api = useApi()
    const isLoggedIn = useState('auth-logged-in', () => false)
    const token = useCookie('auth-token')
    const user = useState('auth-user', () => ({
        id: null as number | null,
        name: '',
        email: '',
        password: '',
        avatar: '🧑‍💻',
        phone: '',
        location: '',
        joinDate: '',
        bio: '',
    }))

    // The cookie is the only thing that survives a reload; useState resets.
    // Rehydrate from it so a returning visitor is not silently logged out.
    const restore = async () => {
        if (!token.value) {
            isLoggedIn.value = false
            return false
        }

        try {
            await fetchProfile()
            isLoggedIn.value = Boolean(user.value.id)
        } catch {
            isLoggedIn.value = false
        }

        // Token expired or revoked — drop it so the UI stops pretending
        if (!isLoggedIn.value) token.value = null

        return isLoggedIn.value
    }

    const login = async (email: string, password: string) => {
        try {
            const res: any = await api.auth.login({ email, password })
            const issued = res.token || res.accessToken
            token.value = issued
            // Pass the token straight through: the cookie write has not landed yet
            await fetchProfile(issued)
            isLoggedIn.value = true
            return res
        } catch (error) {
            console.error('Login failed:', error)
            throw error
        }
    }

    const register = async (name: string, email: string, password: string, phone: string) => {
        try {
            const res: any = await api.auth.register({ name, email, password, phone })
            token.value = res.token || res.accessToken
            user.value.name = name
            user.value.email = email
            user.value.password = password
            user.value.phone = phone
            isLoggedIn.value = true
            return res
        } catch (error) {
            console.error('Registration failed:', error)
            throw error
        }
    }

    const fetchProfile = async (explicitToken?: string) => {
        const res: any = await api.auth.getProfile(explicitToken)
        const profile = res?.data ?? res
        user.value = {
            ...user.value,
            ...profile,
            avatar: profile.avatar || '🧑‍💻',
        }
        return user.value
    }

    const logout = () => {
        token.value = null
        isLoggedIn.value = false
        user.value = {
            id: null,
            name: '',
            email: '',
            avatar: '🧑‍💻',
            password: '',
            phone: '',
            location: '',
            joinDate: '',
            bio: '',
        }
    }

    return { isLoggedIn, user, token, login, register, logout, fetchProfile, restore }
}
