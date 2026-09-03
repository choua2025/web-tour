import { Router } from 'express';
import * as tourController from '../controllers/tour.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../constants/authorize.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

// Public catalogue reads (the storefront browses these before signing in);
// writes stay admin-only.

router.get('/', tourController.getAll);
router.get('/:id', tourController.getById);
router.post('/', authenticate, authorize(ROLES.ADMIN), tourController.create);
router.put('/:id', authenticate, authorize(ROLES.ADMIN), tourController.update);
router.delete('/:id', authenticate, authorize(ROLES.ADMIN), tourController.remove);

export default router;
