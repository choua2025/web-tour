import { Router } from 'express';


const router = Router();

router.get('/test', async (req, res) => {
    res.json({ message: 'Test endpoint is working' });
});

export default router;