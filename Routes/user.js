import { Router } from 'express';
import { getMyProfile, updateMyProfile } from '../Controllers/user.js';
import { verify } from '../jwt.js';

const userRouter = Router();

userRouter.get('/getMyProfile', verify, getMyProfile);
userRouter.post('/updateMyProfile', verify, updateMyProfile);

export default userRouter;
