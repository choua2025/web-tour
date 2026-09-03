import { ref, onBeforeUnmount } from 'vue'

type Handler = (payload: any) => void

/**
 * Subscribes to the API's server-sent events.
 *
 * EventSource cannot set headers, so the JWT travels as a query parameter; the
 * API redacts it from its request log. Callers keep their polling as a fallback
 * — `connected` says whether the stream is actually carrying anything.
 */
export const useServerEvents = (handlers: Record<string, Handler> = {}) => {
    const connected = ref(false)
    let source: EventSource | null = null
    // EventSource retries on its own, but not after an auth failure — a revoked
    // token would otherwise reconnect in a tight loop forever.
    let authFailures = 0

    const close = () => {
        source?.close()
        source = null
        connected.value = false
    }

    const open = () => {
        if (!import.meta.client || source) return

        const token = useCookie('auth-token').value
        if (!token) return

        const base = useRuntimeConfig().public.apiBase as string
        source = new EventSource(`${base}/events?token=${encodeURIComponent(token)}`)

        source.addEventListener('connected', () => {
            connected.value = true
            authFailures = 0
        })

        for (const [type, handler] of Object.entries(handlers)) {
            source.addEventListener(type, (event: MessageEvent) => {
                try {
                    handler(JSON.parse(event.data))
                } catch {
                    handler(null)
                }
            })
        }

        source.onerror = () => {
            connected.value = false
            if (source?.readyState === EventSource.CLOSED) {
                authFailures += 1
                if (authFailures >= 3) close()
            }
        }
    }

    onBeforeUnmount(close)

    return { connected, open, close }
}
