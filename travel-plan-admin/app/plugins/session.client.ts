import { useAuthStore } from '~/stores/auth'

// Named so it loads after `axios.ts` — it needs `$api` to already be provided.
// Pinia state is lost on a full page reload, so rehydrate the operator profile
// from the surviving auth_token cookie.
export default defineNuxtPlugin(async () => {
    const token = useCookie('auth_token')
    if (!token.value) return

    const authStore = useAuthStore()
    const profile = await authStore.fetchProfile()

    // Token expired / revoked, or the account lost admin rights
    if (!profile || profile.role !== 'admin') {
        authStore.logoutSilently()
        await navigateTo('/login')
    }
})
