import {Router} from 'express';

const router = Router();

router.get('/test1', async (req, res) => {
    res.json({ message: 'Test1 endpoint is working1' });
});

export default router;