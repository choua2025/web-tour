import { defineStore } from 'pinia'

export const useToursStore = defineStore('tours', {
    state: () => ({
        items: [] as any[],
        loading: false,
        error: null as string | null,
        currentItem: null as any | null,
    }),
    actions: {
        async getAll() {
            this.loading = true
            try {
                const { $api } = useNuxtApp() as any
                const response = await $api.get('/tours')
                const data = response.data
                this.items = Array.isArray(data) ? data : data.data || []
            } catch (err: any) {
                this.error = err?.response?.data?.message || err?.message
            } finally {
                this.loading = false
            }
        },
        async getById(id: string | number) {
            this.loading = true
            try {
                const { $api } = useNuxtApp() as any
                const response = await $api.get(`/tours/${id}`)
                const item = response.data?.data || response.data
                this.currentItem = item
                return item
            } catch (err: any) {
                this.error = err?.response?.data?.message || err?.message
            } finally {
                this.loading = false
            }
        },
        async create(item: any) {
            this.loading = true
            try {
                const { $api } = useNuxtApp() as any
                const response = await $api.post('/tours', item)
                const created = response.data?.data || response.data
                this.items.push(created)
                return created
            } catch (err: any) {
                this.error = err?.response?.data?.message || err?.message
                throw err
            } finally {
                this.loading = false
            }
        },
        async update(id: string | number, item: any) {
            this.loading = true
            try {
                const { $api } = useNuxtApp() as any
                const response = await $api.put(`/tours/${id}`, item)
                const updated = response.data?.data || response.data
                const index = this.items.findIndex((i: any) => i.id === id)
                if (index !== -1) this.items[index] = updated
                return updated
            } catch (err: any) {
                this.error = err?.response?.data?.message || err?.message
                throw err
            } finally {
                this.loading = false
            }
        },
        async remove(id: string | number) {
            this.loading = true
            try {
                const { $api } = useNuxtApp() as any
                await $api.delete(`/tours/${id}`)
                this.items = this.items.filter((i: any) => i.id !== id)
            } catch (err: any) {
                this.error = err?.response?.data?.message || err?.message
                throw err
            } finally {
                this.loading = false
            }
        }
    }
})
