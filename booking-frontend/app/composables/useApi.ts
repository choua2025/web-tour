export const useApi = () => {
    const config = useRuntimeConfig()
    // During SSR the request leaves this Node process, not the browser, so the
    // public URL can be unreachable from here (in Docker `localhost` is this
    // container). apiBaseServer covers that; empty means the two are the same.
    const BASE_URL = (import.meta.server && config.apiBaseServer
        ? config.apiBaseServer
        : config.public.apiBase) as string

    const fetchApi = async (endpoint: string, options: any = {}) => {
        const url = `${BASE_URL}${endpoint}`
        // `token` lets a caller pass the credential explicitly. Nuxt writes
        // useCookie changes in a watcher, so a request fired immediately after
        // logging in can still read the old (empty) cookie.
        const { token: explicitToken, ...fetchOptions } = options
        const credential = explicitToken ?? useCookie('auth-token').value

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...options.headers,
        }

        if (credential) {
            headers['Authorization'] = `Bearer ${credential}`
        }

        try {
            const response = await $fetch(url, {
                ...fetchOptions,
                headers,
            })
            return response
        } catch (error: any) {
            console.error(`API Error [${endpoint}]:`, error)
            throw error
        }
    }

    // Helper: extract array from API response (handles { data: [] }, { rows: [] }, or plain [])
    const extractArray = (response: any): any[] => {
        if (Array.isArray(response)) return response
        if (response?.data && Array.isArray(response.data)) return response.data
        if (response?.rows && Array.isArray(response.rows)) return response.rows
        // Try to find any array property in the response
        if (response && typeof response === 'object') {
            const keys = Object.keys(response)
            for (const key of keys) {
                if (Array.isArray(response[key])) return response[key]
            }
        }
        return []
    }

    // Auth API
    const auth = {
        register: (data: { name: string; email: string; password: string, phone: string }) =>
            fetchApi('/auth/register', { method: 'POST', body: data }),
        login: (data: { email: string; password: string }) =>
            fetchApi('/auth/login', { method: 'POST', body: data }),
        getProfile: (token?: string) =>
            fetchApi('/auth/profile', token ? { token } : {}),
        forgotPassword: (email: string) =>
            fetchApi('/auth/forgot-password', { method: 'POST', body: { email } }),
        resetPassword: (email: string, code: string, newPassword: string) =>
            fetchApi('/auth/reset-password', { method: 'POST', body: { email, code, newPassword } }),
    }

    // Tours API
    const tours = {
        getAll: () => fetchApi('/tours'),
        getById: (id: number | string) => fetchApi(`/tours/${id}`),
        create: (data: any) => fetchApi('/tours', { method: 'POST', body: data }),
        update: (id: number | string, data: any) => fetchApi(`/tours/${id}`, { method: 'PUT', body: data }),
        remove: (id: number | string) => fetchApi(`/tours/${id}`, { method: 'DELETE' }),
    }

    // Hotels API
    const hotels = {
        getAll: () => fetchApi('/hotels'),
        getById: (id: number | string) => fetchApi(`/hotels/${id}`),
        create: (data: any) => fetchApi('/hotels', { method: 'POST', body: data }),
        update: (id: number | string, data: any) => fetchApi(`/hotels/${id}`, { method: 'PUT', body: data }),
        remove: (id: number | string) => fetchApi(`/hotels/${id}`, { method: 'DELETE' }),
    }

    // Destinations API
    const destinations = {
        getAll: () => fetchApi('/destinations'),
        getById: (id: number | string) => fetchApi(`/destinations/${id}`),
        create: (data: any) => fetchApi('/destinations', { method: 'POST', body: data }),
        update: (id: number | string, data: any) => fetchApi(`/destinations/${id}`, { method: 'PUT', body: data }),
        remove: (id: number | string) => fetchApi(`/destinations/${id}`, { method: 'DELETE' }),
    }

    // Bookings API
    const bookings = {
        // The API paginates; pass { limit, page } when a caller needs more.
        getAll: (params: Record<string, any> = {}) => {
            const query = new URLSearchParams(params as any).toString()
            return fetchApi(`/bookings${query ? `?${query}` : ''}`)
        },
        getById: (id: number | string) => fetchApi(`/bookings/${id}`),
        create: (data: any) => fetchApi('/bookings', { method: 'POST', body: data }),
        update: (id: number | string, data: any) => fetchApi(`/bookings/${id}`, { method: 'PUT', body: data }),
        remove: (id: number | string) => fetchApi(`/bookings/${id}`, { method: 'DELETE' }),
    }

    // Payments API
    const payments = {
        getAll: () => fetchApi('/payments'),
        getById: (id: number | string) => fetchApi(`/payments/${id}`),
        create: (data: any) => fetchApi('/payments', { method: 'POST', body: data }),
        update: (id: number | string, data: any) => fetchApi(`/payments/${id}`, { method: 'PUT', body: data }),
        remove: (id: number | string) => fetchApi(`/payments/${id}`, { method: 'DELETE' }),
        createCheckoutSession: (data: { booking_id: number | string }) => fetchApi('/payments/create-checkout-session', { method: 'POST', body: data }),
    }

    // Reviews API
    const reviews = {
        getAll: () => fetchApi('/reviews'),
        getById: (id: number | string) => fetchApi(`/reviews/${id}`),
        create: (data: any) => fetchApi('/reviews', { method: 'POST', body: data }),
        update: (id: number | string, data: any) => fetchApi(`/reviews/${id}`, { method: 'PUT', body: data }),
        remove: (id: number | string) => fetchApi(`/reviews/${id}`, { method: 'DELETE' }),
    }

    // Users API
    const users = {
        getAll: () => fetchApi('/users'),
        getById: (id: number | string) => fetchApi(`/users/${id}`),
        create: (data: any) => fetchApi('/users', { method: 'POST', body: data }),
        update: (id: number | string, data: any) => fetchApi(`/users/${id}`, { method: 'PUT', body: data }),
        remove: (id: number | string) => fetchApi(`/users/${id}`, { method: 'DELETE' }),
    }

    // Transports API
    const transports = {
        getAll: () => fetchApi('/transports'),
        getById: (id: number | string) => fetchApi(`/transports/${id}`),
        create: (data: any) => fetchApi('/transports', { method: 'POST', body: data }),
        update: (id: number | string, data: any) => fetchApi(`/transports/${id}`, { method: 'PUT', body: data }),
        remove: (id: number | string) => fetchApi(`/transports/${id}`, { method: 'DELETE' }),
    }

    // Contact API
    const contact = {
        send: (email: string) => fetchApi('/contact', { method: 'POST', body: { email } }),
    }

    return {
        fetchApi,
        extractArray,
        auth,
        tours,
        hotels,
        destinations,
        bookings,
        payments,
        reviews,
        users,
        transports,
        contact,
    }
}
