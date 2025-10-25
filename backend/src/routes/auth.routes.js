import express from 'express';
import { body } from 'express-validator';
import { register, login , me , updateUser , deleteUser} from '../controllers/auth.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register' , [
    body('name').isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], 
    register
)

router.post('/login' , [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').exists().withMessage('Password is required')
],
    login
)

router.get('/me' , authMiddleware , me)


router.put('/:id' , authMiddleware, updateUser)
router.delete('/:id', authMiddleware, deleteUser)

export default router