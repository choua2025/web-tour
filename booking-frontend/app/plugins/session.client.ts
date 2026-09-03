// useState is per-request state and resets on every full page load, so without
// this a returning visitor with a perfectly good auth-token cookie would render
// as a stranger. Runs before the router so guarded routes see the real answer.
export default defineNuxtPlugin({
    name: 'restore-session',
    enforce: 'pre',
    async setup() {
        const { restore } = useAuth()
        await restore()
    },
})
