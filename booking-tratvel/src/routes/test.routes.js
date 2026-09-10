import { Router } from 'express';


const router = Router();

router.post('/test', async (req, res) => {
    res.json({ message: 'Test endpoint is working' });
});

export default router;