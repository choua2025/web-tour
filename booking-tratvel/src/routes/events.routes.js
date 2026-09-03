import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { addClient, clientCount } from '../utils/events.js';

const router = Router();

// EventSource cannot set an Authorization header, so the token arrives as a
// query parameter. The request logger redacts it so it never reaches the
// terminal or a log file.
const authenticateStream = (req, res, next) => {
    const bearer = req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null;
    const token = bearer || req.query.token;

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access denied. No token provided' });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        return next();
    } catch {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

router.get('/', authenticateStream, (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        // nginx buffers proxied responses by default, which would hold events
        // back until the buffer fills.
        'X-Accel-Buffering': 'no',
    });
    // Flush the headers so the browser marks the stream open immediately.
    res.flushHeaders?.();

    addClient(res, req.user);

    res.write(`event: connected\ndata: ${JSON.stringify({
        userId: req.user.id,
        role: req.user.role,
        at: new Date().toISOString(),
    })}\n\n`);

    console.log(`[events] ${req.user.email} connected (${clientCount()} open)`);
    req.on('close', () => console.log(`[events] ${req.user.email} left (${clientCount()} open)`));
});

export default router;
