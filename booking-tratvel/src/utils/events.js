// A tiny server-sent-events hub.
//
// Chosen over WebSockets because every event here travels one way — the server
// telling a console that something happened. EventSource also reconnects by
// itself, which a hand-rolled socket client would have to reimplement.
//
// Subscribers live in this process's memory. That is fine for the single
// `app.listen` this project runs; behind a cluster or several containers each
// instance would only reach its own clients, and this would need Postgres
// LISTEN/NOTIFY or Redis underneath it.

const clients = new Set();

// Proxies and load balancers drop a stream that goes quiet. A comment line is
// ignored by EventSource but keeps the connection accounted for.
const HEARTBEAT_MS = 25_000;

let heartbeat = null;

const startHeartbeat = () => {
    if (heartbeat) return;
    heartbeat = setInterval(() => {
        for (const client of clients) {
            try {
                client.res.write(': ping\n\n');
            } catch {
                remove(client);
            }
        }
    }, HEARTBEAT_MS);
    // Never hold the process open just for pings.
    heartbeat.unref?.();
};

const stopHeartbeat = () => {
    if (heartbeat && clients.size === 0) {
        clearInterval(heartbeat);
        heartbeat = null;
    }
};

const remove = (client) => {
    clients.delete(client);
    stopHeartbeat();
};

/**
 * Registers an open response as an SSE stream.
 * @param {object} res      express response, headers already sent
 * @param {object} user     the authenticated JWT payload
 */
export const addClient = (res, user) => {
    const client = { res, user };
    clients.add(client);
    startHeartbeat();

    res.on('close', () => remove(client));
    return client;
};

/**
 * Sends an event to interested clients.
 *
 * @param {string} type              event name, e.g. 'booking.created'
 * @param {object} payload           JSON-serialisable body
 * @param {object} [options]
 * @param {number} [options.userId]  when set, only that customer and admins
 *                                   receive it — a booking must not leak to
 *                                   another customer's open tab
 */
export const broadcast = (type, payload, { userId } = {}) => {
    if (!clients.size) return 0;

    const frame = `event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`;
    let delivered = 0;

    for (const client of clients) {
        const isAdmin = client.user?.role === 'admin';
        const isOwner = userId != null && Number(client.user?.id) === Number(userId);
        if (userId != null && !isAdmin && !isOwner) continue;

        try {
            client.res.write(frame);
            delivered += 1;
        } catch {
            remove(client);
        }
    }

    return delivered;
};

export const clientCount = () => clients.size;
