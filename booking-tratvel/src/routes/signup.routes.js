import {Router} from 'express';

const router = Router();

router.get('/signup', (req, res) => {
    res.json({ message: 'Signup route' });
});

export default router;
