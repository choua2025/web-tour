const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password']

export default defineNuxtRouteMiddleware((to) => {
    const isAuthenticated = useCookie('auth_token').value
    const isPublic = PUBLIC_ROUTES.includes(to.path)

    if (!isAuthenticated && !isPublic) {
        return navigateTo('/login')
    }

    if (isAuthenticated && isPublic) {
        return navigateTo('/')
    }
})
