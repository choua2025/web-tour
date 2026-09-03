import { defineStore } from 'pinia'

export const usePaymentsStore = defineStore('payments', {
    state: () => ({
        items: [] as any[],
        loading: false,
        error: null as string | null,
        currentItem: null as any | null,
        meta: null as any | null,
    }),
    actions: {
        // `type` is 'tour' | 'hotel' | undefined (everything).
        async getAll(type?: string) {
            this.loading = true
            try {
                const { $api } = useNuxtApp() as any
                const response = await $api.get('/payments', {
                    params: type ? { type } : {},
                })
                const data = response.data
                this.items = Array.isArray(data) ? data : data.data || []
                // Per-type counts and sums, computed server-side over ALL rows
                // so the tab badges stay right whatever is being filtered.
                this.meta = data?.meta ?? null
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
                const response = await $api.get(`/payments/${id}`)
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
                const response = await $api.post('/payments', item)
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
                const response = await $api.put(`/payments/${id}`, item)
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
                await $api.delete(`/payments/${id}`)
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
