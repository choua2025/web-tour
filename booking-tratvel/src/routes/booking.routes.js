import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/',authenticate, bookingController.getAll);
router.get('/:id', authenticate, bookingController.getById);
router.post('/', authenticate, bookingController.create);
router.put('/:id', authenticate, bookingController.update);
router.delete('/:id', authenticate, bookingController.remove);

export default router;
