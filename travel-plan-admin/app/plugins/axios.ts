import axios from 'axios'

export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiUrl as string

    const api = axios.create({
        baseURL,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })

    // Add a request interceptor to include auth token.
    // `config.token` wins over the cookie: Nuxt writes useCookie changes in a
    // watcher, so a request fired straight after signing in can still read the
    // pre-login (empty) cookie.
    api.interceptors.request.use((config: any) => {
        const token = config.token ?? useCookie('auth_token').value
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
        }

        // A file upload has to travel as multipart, and only the browser can
        // write the boundary — the JSON default above would corrupt the body.
        if (config.data instanceof FormData && config.headers) {
            delete config.headers['Content-Type']
        }

        return config
    })

    // Provide the api instance globally as $api
    return {
        provide: {
            api: api
        }
    }
})
