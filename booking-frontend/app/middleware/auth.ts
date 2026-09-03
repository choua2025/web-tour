// Guards the pages that act on a real account — booking, paying, and anything
// that shows the visitor their own records. Send them to sign in first and
// remember where they were headed so the trip resumes after login.
export default defineNuxtRouteMiddleware(async (to) => {
    const { isLoggedIn, token, restore } = useAuth()

    if (isLoggedIn.value) return

    // On a hard load straight into a guarded URL the plugin may not have
    // finished; if a cookie exists, give it a chance before turning them away.
    if (token.value && (await restore())) return

    return navigateTo({
        path: '/login',
        query: { redirect: to.fullPath },
    })
})
