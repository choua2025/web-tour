import { Router } from 'express';
import sequelize from '../config/database.js';
import { pendingMigrations } from '../utils/migrations.js';

const router = Router();

// Deliberately unauthenticated and cheap: Docker, a load balancer and CI all
// need to ask "is this container usable yet?" before any token exists.
//
// A container that answers before the database is reachable would be marked
// healthy and start receiving traffic it cannot serve, so the check actually
// touches the connection rather than just returning 200.
router.get('/', async (_req, res) => {
    const started = Date.now();

    try {
        await sequelize.authenticate();
    } catch (error) {
        return res.status(503).json({
            status: 'unhealthy',
            database: 'unreachable',
            message: error.message,
        });
    }

    let pending = [];
    try {
        pending = await pendingMigrations();
    } catch {
        // Not fatal — the schema question is reported, not enforced here.
    }

    return res.json({
        status: 'ok',
        database: 'connected and reachable successfully to run migrations',
        // Surfaced rather than failed on: a rolling deploy legitimately runs
        // with the new image before the migration job has finished.
        pendingMigrations: pending.length,
        uptimeSeconds: Math.round(process.uptime()),
        checkedInMs: Date.now() - started,
    });
});

export default router;
