import { Router } from 'express';
import * as destinationController from '../controllers/destination.controller.js';
import { uploadSingle } from '../utils/upload.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../constants/authorize.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/', destinationController.getAll);
router.get('/all', destinationController.getAllDestinations);
router.get('/:id', destinationController.getById);
router.post('/', authenticate, authorize(ROLES.ADMIN), uploadSingle, destinationController.create);
router.put('/:id', authenticate, authorize(ROLES.ADMIN), uploadSingle, destinationController.update);
router.delete('/:id', authenticate, authorize(ROLES.ADMIN), destinationController.remove);

export default router;
