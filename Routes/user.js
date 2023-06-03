import { Router } from 'express';
import multer from 'multer';
import {
  getMyGroups,
  getMyProfile,
  updateMyProfile,
} from '../Controllers/user.js';
import { verify } from '../jwt.js';

const userRouter = Router();
const storage = new multer.memoryStorage();
const upload = multer({ storage });

userRouter.get('/getMyProfile', verify, getMyProfile);
userRouter.get('/getMyGroups', verify, getMyGroups);
userRouter.post('/updateMyProfile', verify, upload.any(), updateMyProfile);

export default userRouter;
