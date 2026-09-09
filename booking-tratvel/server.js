import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { sequelize } from './src/models/index.js';
import routes from './src/routes/index.js';
import * as paymentController from './src/controllers/payment.controller.js';
import { requestLogger } from './src/middleware/logger.middleware.js';
import { pendingMigrations } from './src/utils/migrations.js';

// ── Fail fast on an unusable signing key ────────
// A missing or placeholder secret means every JWT this process issues is
// forgeable, so refuse to start rather than serve a wide-open API.
const WEAK_SECRETS = ['your_jwt_secret_key_here', 'secret', 'changeme'];
if (!process.env.JWT_SECRET || WEAK_SECRETS.includes(process.env.JWT_SECRET)) {
    console.error('❌ JWT_SECRET is missing or still set to a placeholder. Set a strong random value in .env:');
    console.error('   node -e ' + JSON.stringify("console.log(require('crypto').randomBytes(48).toString('base64url'))"));
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT;
// Bind every interface so the API answers on localhost AND on whatever LAN
// address this machine currently has. Binding a single hard-coded IP meant
// `localhost:9001` was unreachable and every Wi-Fi change broke the frontends.
// IP is kept only to print a LAN-reachable URL (handy for testing on a phone).
const HOST = process.env.HOST || '0.0.0.0';
const IP = process.env.IP;
// ── Middleware ──────────────────────────────────
app.use(cors());

// Above the routes (and above the webhook) so every transaction is accounted
// for; it reports on 'finish', by which point req.user and the response body
// are both known.
app.use(requestLogger);

// Stripe Webhook MUST be before express.json()
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), paymentController.handleStripeWebhook);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/health', (req, res) => res.json({ status: 'ok', message: 'Server is running' }));

// ── API Routes ─────────────────────────────────
app.use('/api', routes);

// ── Start server ───────────────────────────────
// Deliberately NOT sequelize.sync(). Plain sync() creates missing tables but
// never alters existing ones, so model changes silently never reached the
// database (the booking contact_* columns had to be applied by hand). Worse,
// one day someone adds { alter: true } or { force: true } and a restart
// rewrites or drops live tables. Migrations own the schema; the server only
// checks that the connection works and that nothing is outstanding.
const start = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected');

        const pending = await pendingMigrations();
        if (pending.length) {
            console.warn('');
            console.warn(`⚠️  ${pending.length} migration(s) not applied to this database:`);
            for (const file of pending) console.warn(`     • ${file}`);
            console.warn('   Run `npm run migrate:up` (or `npm run migrate:baseline` on an');
            console.warn('   existing database whose tables predate migration tracking).');
            console.warn('');
        }

        app.listen(PORT, HOST, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
            if (IP) console.log(`   also reachable on http://${IP}:${PORT} (LAN)`);
        });
    } catch (err) {
        console.error('❌ Could not start:', err.message);
        process.exit(1);
    }
};

start();
