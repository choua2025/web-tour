import { defineStore } from 'pinia'

const SEEN_KEY = 'admin:seenBookingIds'
// Previous scheme: a single high-water mark. Kept so an upgrade does not make
// every old booking light up as new again.
const LEGACY_KEY = 'admin:lastSeenBookingId'

// Polling is now the fallback, not the mechanism. When the event stream is up
// the bell already knows within a second, so this only has to catch the case
// where the stream died silently.
const POLL_MS = 30_000
const POLL_MS_WITH_STREAM = 5 * 60_000
const FEED_SIZE = 15
// The feed only ever shows the newest handful, so remembering more than this
// serves nothing but a growing localStorage entry.
const MAX_REMEMBERED = 200

// localStorage throws in some embedded/private contexts, and does not exist
// during SSR — never let a bookmark-keeping detail break the navbar.
const readSeenIds = (): number[] => {
    if (!import.meta.client) return []
    try {
        const raw = window.localStorage.getItem(SEEN_KEY)
        if (raw) {
            const parsed = JSON.parse(raw)
            if (Array.isArray(parsed)) return parsed.map(Number).filter((n) => !Number.isNaN(n))
        }
    } catch {
        /* fall through to the legacy key */
    }
    return []
}

const readLegacyFloor = (): number => {
    if (!import.meta.client) return 0
    try {
        return Number(window.localStorage.getItem(LEGACY_KEY)) || 0
    } catch {
        return 0
    }
}

const writeSeenIds = (ids: number[]) => {
    if (!import.meta.client) return
    try {
        window.localStorage.setItem(SEEN_KEY, JSON.stringify(ids))
    } catch {
        /* not worth surfacing — the badge just reappears next session */
    }
}

export const useNotificationsStore = defineStore('notifications', {
    state: () => ({
        bookings: [] as any[],
        // Ids the operator has already opened or dismissed.
        seenIds: [] as number[],
        // Everything at or below this was read under the old scheme.
        legacyFloor: 0,
        loading: false,
        error: null as string | null,
        timer: null as ReturnType<typeof setInterval> | null,
        streaming: false,
    }),

    getters: {
        isSeen: (state) => (id: number | string) => {
            const numeric = Number(id)
            return numeric <= state.legacyFloor || state.seenIds.includes(numeric)
        },
        // The bell lists what still needs attention; opening one clears it.
        unread(): any[] {
            return this.bookings.filter((b: any) => !this.isSeen(b.id))
        },
        unreadCount(): number {
            return this.unread.length
        },
    },

    actions: {
        async fetch() {
            this.loading = true
            try {
                const { $api } = useNuxtApp() as any
                // Ask for exactly the feed size instead of pulling the whole
                // table and slicing it here.
                const response = await $api.get('/bookings', { params: { limit: FEED_SIZE } })
                const data = response.data
                this.bookings = Array.isArray(data) ? data : data?.data || []
                this.error = null
            } catch (err: any) {
                this.error = err?.response?.data?.message || err?.message || 'Could not load bookings'
            } finally {
                this.loading = false
            }
        },

        // Called when the operator opens a booking from the bell.
        markRead(id: number | string) {
            const numeric = Number(id)
            if (Number.isNaN(numeric) || this.isSeen(numeric)) return

            this.seenIds = [numeric, ...this.seenIds].slice(0, MAX_REMEMBERED)
            writeSeenIds(this.seenIds)
        },

        markAllRead() {
            const ids = this.bookings.map((b: any) => Number(b.id)).filter((n) => !Number.isNaN(n))
            const merged = [...new Set([...ids, ...this.seenIds])]
            this.seenIds = merged.sort((a, b) => b - a).slice(0, MAX_REMEMBERED)
            writeSeenIds(this.seenIds)
        },

        // Called when the SSE stream opens or drops, so the poll interval can
        // follow. Belt and braces: if the stream lies about being up, the slow
        // poll still catches everything.
        setStreaming(on: boolean) {
            if (this.streaming === on) return
            this.streaming = on
            this.restartTimer()
        },

        restartTimer() {
            if (!import.meta.client) return
            if (this.timer) clearInterval(this.timer)
            const every = this.streaming ? POLL_MS_WITH_STREAM : POLL_MS
            this.timer = setInterval(() => this.fetch(), every)
        },

        start() {
            if (!import.meta.client || this.timer) return
            this.seenIds = readSeenIds()
            this.legacyFloor = readLegacyFloor()
            this.fetch()
            this.restartTimer()
        },

        stop() {
            if (this.timer) {
                clearInterval(this.timer)
                this.timer = null
            }
            this.streaming = false
        },
    },
})
