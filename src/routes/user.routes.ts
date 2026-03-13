import { Router } from 'express';
import { getUser, updateUser, deleteUser } from '../controllers/user.controller';
import { validate } from '../middlewares/validate.middleware';
import { userSchema } from '../schemas/user.schema';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/users/:id', authenticate, getUser);
router.put('/users/:id', authenticate, validate(userSchema), updateUser);
router.delete('/users/:id', authenticate, deleteUser);

export default router;