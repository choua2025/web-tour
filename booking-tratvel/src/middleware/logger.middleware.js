// Prints one line per API transaction to the backend terminal:
//
//   19:42:07  POST   /api/bookings          201   88ms  #12 somchai@x.com (user)
//                    └ booking #5 · Luang Prabang City Tour · 2 pax · 300.00
//
// Set LOG_REQUESTS=false in .env to silence it.

const ENABLED = process.env.LOG_REQUESTS !== 'false';

// Only colourise a real terminal — piping to a file should stay plain text.
const useColour = process.stdout.isTTY;
const paint = (code, text) => (useColour ? `\x1b[${code}m${text}\x1b[0m` : text);
const dim = (t) => paint('2', t);
const bold = (t) => paint('1', t);

const statusColour = (status) => {
    if (status >= 500) return '31'; // red
    if (status >= 400) return '33'; // yellow
    if (status >= 300) return '36'; // cyan
    return '32'; // green
};

const methodColour = {
    GET: '36',
    POST: '32',
    PUT: '33',
    PATCH: '33',
    DELETE: '31',
};

const clock = () => new Date().toTimeString().slice(0, 8);

// EventSource can only authenticate through the query string, so a JWT can end
// up in the URL. Never let one reach the terminal or a log file.
const safeUrl = (url) => url.replace(/([?&]token=)[^&]+/i, '$1***');

// Never let a password, token or card detail reach the log.
const SECRET_KEYS = /^(password|newPassword|confirmPassword|token|code|secret|authorization|card|cvc)$/i;

const preview = (body) => {
    if (!body || typeof body !== 'object' || Array.isArray(body)) return '';
    const parts = [];
    for (const [key, value] of Object.entries(body)) {
        if (SECRET_KEYS.test(key)) {
            parts.push(`${key}=***`);
        } else if (value !== null && typeof value === 'object') {
            continue; // nested payloads are noise on one line
        } else {
            parts.push(`${key}=${String(value).slice(0, 40)}`);
        }
        if (parts.length >= 6) break;
    }
    return parts.join(' ');
};

// A human sentence for the transactions worth reading at a glance.
const describe = (req, payload) => {
    const data = payload?.data;
    if (!data) return payload?.message || '';

    if (req.originalUrl.includes('/bookings') && data.tour_id !== undefined) {
        return `booking #${data.id} · tour ${data.tour_id} · ${data.number_of_people} pax · ${data.total_price}`;
    }
    if (req.originalUrl.includes('/payments') && data.amount !== undefined) {
        return `payment #${data.id} · booking ${data.booking_id} · ${data.amount} · ${data.status ?? ''}`.trim();
    }
    if (req.originalUrl.includes('/auth/register')) {
        return `registered ${data.email} as ${data.role}`;
    }
    if (data.id !== undefined) {
        const label = data.title || data.name || data.email || '';
        return `#${data.id}${label ? ' · ' + label : ''}`;
    }
    return '';
};

export const requestLogger = (req, res, next) => {
    if (!ENABLED) return next();

    const startedAt = process.hrtime.bigint();

    // Capture the payload so the summary line can name what actually changed.
    let payload = null;
    const originalJson = res.json.bind(res);
    res.json = (body) => {
        payload = body;
        return originalJson(body);
    };

    res.on('finish', () => {
        const ms = Number(process.hrtime.bigint() - startedAt) / 1e6;
        const who = req.user
            ? `#${req.user.id} ${req.user.email} (${req.user.role})`
            : 'guest';

        const line = [
            dim(clock()),
            paint(methodColour[req.method] || '37', req.method.padEnd(6)),
            safeUrl(req.originalUrl).padEnd(34),
            paint(statusColour(res.statusCode), String(res.statusCode)),
            dim(`${ms.toFixed(0)}ms`.padStart(7)),
            dim(who),
        ].join('  ');

        console.log(line);

        // Second line: what the caller sent, and what came of it.
        const isWrite = req.method !== 'GET' && req.method !== 'HEAD';
        if (isWrite) {
            const sent = preview(req.body);
            if (sent) console.log(dim(`          ├ in  ${sent}`));
        }

        if (res.statusCode >= 400) {
            const reason = payload?.message || 'request failed';
            console.log(paint(statusColour(res.statusCode), `          └ ${reason}`));
        } else if (isWrite) {
            const summary = describe(req, payload);
            if (summary) console.log(bold(`          └ ${summary}`));
        }
    });

    next();
};

export default requestLogger;
