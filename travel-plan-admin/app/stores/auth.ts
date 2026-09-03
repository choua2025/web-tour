import { defineStore } from 'pinia'
import type { User, LoginCredentials } from '~/types'

const messageOf = (err: any, fallback: string) =>
    err?.response?.data?.message || err?.message || fallback

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as User | null,
        loading: false,
        error: null as string | null
    }),

    getters: {
        isAdmin: (state) => state.user?.role === 'admin'
    },

    actions: {
        async login(credentials: LoginCredentials) {
            this.loading = true
            this.error = null

            try {
                const { $api } = useNuxtApp() as any
                // API replies with { success, message, token }
                const response = await $api.post('/auth/login', credentials)

                const issued = response.data.token
                const token = useCookie('auth_token')
                token.value = issued

                // The token carries the role, but the profile endpoint is the
                // source of truth — and it also fills the user object. Pass the
                // token through directly; the cookie write has not landed yet.
                const profile = await this.fetchProfile(issued)

                if (profile?.role !== 'admin') {
                    this.logoutSilently()
                    throw new Error('This account does not have admin access')
                }

                return response.data
            } catch (err: any) {
                this.error = messageOf(err, 'Authentication failed')
                throw err
            } finally {
                this.loading = false
            }
        },

        async fetchProfile(explicitToken?: string) {
            try {
                const { $api } = useNuxtApp() as any
                const response = await $api.get('/auth/profile', explicitToken ? { token: explicitToken } : {})
                this.user = response.data?.data ?? response.data
                return this.user
            } catch (err: any) {
                this.user = null
                return null
            }
        },

        async forgotPassword(email: string) {
            this.loading = true
            this.error = null

            try {
                const { $api } = useNuxtApp() as any
                const response = await $api.post('/auth/forgot-password', { email })
                return response.data
            } catch (err: any) {
                this.error = messageOf(err, 'Failed to send reset code')
                throw err
            } finally {
                this.loading = false
            }
        },

        async resetPassword(payload: { email: string; code: string; newPassword: string }) {
            this.loading = true
            this.error = null

            try {
                const { $api } = useNuxtApp() as any
                const response = await $api.post('/auth/reset-password', payload)
                return response.data
            } catch (err: any) {
                this.error = messageOf(err, 'Failed to reset password')
                throw err
            } finally {
                this.loading = false
            }
        },

        logoutSilently() {
            this.user = null
            const token = useCookie('auth_token')
            token.value = null
        },

        logout() {
            this.logoutSilently()
            navigateTo('/login')
        }
    }
})
