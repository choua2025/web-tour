import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../constants/authorize.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

// The directory of accounts is admin-only. A customer reads their own record
// through GET /api/auth/profile, and edits it through PUT /:id (guarded in the
// controller so they can only touch their own row, and never their role).
router.get('/', authenticate, authorize(ROLES.ADMIN), userController.getAll);
router.get('/:id', authenticate, authorize(ROLES.ADMIN), userController.getById);
router.post('/', authenticate, authorize(ROLES.ADMIN), userController.create);
router.put('/:id', authenticate, userController.update);
router.delete('/:id', authenticate, authorize(ROLES.ADMIN), userController.remove);

export default router;
