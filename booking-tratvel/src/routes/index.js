import { Router } from 'express';

import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import destinationRoutes from './destination.routes.js';
import tourRoutes from './tour.routes.js';
import hotelRoutes from './hotel.routes.js';
import transportRoutes from './transport.routes.js';
import bookingRoutes from './booking.routes.js';
import paymentRoutes from './payment.routes.js';
import reviewRoutes from './review.routes.js';
import contactRoutes from './contact.routes.js';
import eventRoutes from './events.routes.js';
import healthRoutes from './health.routes.js';
import loginRoutes from './login.routes.js';
import testRoutes from './test.routes.js';
import test1Routes from './test1.routes.js';

const router = Router();

router.get('/', (_req, res) => {
    res.json({
        code: 200,
        status: 'ok',
        message: 'Welcome to the Travel Booking API',
        version: '1.0.0',
    });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/destinations', destinationRoutes);
router.use('/tours', tourRoutes);
router.use('/hotels', hotelRoutes);
router.use('/transports', transportRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/contact', contactRoutes);
router.use('/events', eventRoutes);
router.use('/health', healthRoutes);
router.use('/login', loginRoutes);
router.use('/test', testRoutes);
router.use('/test1', test1Routes);

export default router;
