import { Router } from 'express';
import {
  addRole,
  createGroup,
  getChatroom,
  getGroupData,
  getGroupMenuData,
  getMember,
  getMyMember,
  getRole,
  joinGroup,
} from '../Controllers/group.js';
import { verify } from '../jwt.js';
import multer from 'multer';

const groupRouter = Router();
const storage = new multer.memoryStorage();
const upload = multer({ storage });

groupRouter.post('/createGroup', verify, upload.single('pic'), createGroup);
groupRouter.post('/joinGroup', verify, joinGroup);
groupRouter.get('/getGroupMenuData', verify, getGroupMenuData);
groupRouter.get('/getGroupData', verify, getGroupData);
groupRouter.get('/getChatroom', verify, getChatroom);
groupRouter.get('/getMyMember', verify, getMyMember);
groupRouter.get('/getMember', verify, getMember);
groupRouter.get('/getRole', verify, getRole);
groupRouter.post('/addRole', verify, addRole);

export default groupRouter;