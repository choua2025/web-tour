import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../constants/authorize.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

// Customers only ever start a checkout; reading and editing the ledger is admin work.
router.post('/create-checkout-session', authenticate, paymentController.createCheckoutSession);

router.get('/', authenticate, authorize(ROLES.ADMIN), paymentController.getAll);
router.get('/:id', authenticate, authorize(ROLES.ADMIN), paymentController.getById);
router.post('/', authenticate, authorize(ROLES.ADMIN), paymentController.create);
router.put('/:id', authenticate, authorize(ROLES.ADMIN), paymentController.update);
router.delete('/:id', authenticate, authorize(ROLES.ADMIN), paymentController.remove);


export default router;
