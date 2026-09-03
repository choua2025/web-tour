import { Router } from 'express';
import * as reviewController from '../controllers/review.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Public catalogue reads (the storefront browses these before signing in);
// writes stay admin-only.

router.get('/', reviewController.getAll);
router.get('/:id', reviewController.getById);
router.post('/', authenticate, reviewController.create);
router.put('/:id', authenticate, reviewController.update);
router.delete('/:id', authenticate, reviewController.remove);

export default router;
