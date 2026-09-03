import { Router } from 'express';
import * as hotelController from '../controllers/hotel.controller.js';
import { uploadSingle } from '../utils/upload.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../constants/authorize.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

// Public catalogue reads (the storefront browses these before signing in);
// writes stay admin-only.

router.get('/', hotelController.getAll);
router.get('/:id', hotelController.getById);
router.post('/', authenticate, authorize(ROLES.ADMIN), uploadSingle, hotelController.create);
router.put('/:id', authenticate, authorize(ROLES.ADMIN), uploadSingle, hotelController.update);
router.delete('/:id', authenticate, authorize(ROLES.ADMIN), hotelController.remove);

export default router;
