import { Router } from 'express';
import * as transportController from '../controllers/transport.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../constants/authorize.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/', authenticate, transportController.getAll);
router.get('/:id', authenticate, transportController.getById);
router.post('/', authenticate, authorize(ROLES.ADMIN), transportController.create);
router.put('/:id', authenticate, authorize(ROLES.ADMIN), transportController.update);
router.delete('/:id', authenticate, authorize(ROLES.ADMIN), transportController.remove);

export default router;
