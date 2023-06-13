import { Router } from 'express';
import {
  addRole,
  createGroup,
  delRole,
  editRole,
  getChatroom,
  getGroupData,
  getGroupMenuData,
  getMember,
  getMyMember,
  getRole,
  joinGroup,
  delMember,
  editMember,
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
groupRouter.post('/editrole', verify, editRole);
groupRouter.post('/delrole', verify, delRole);
groupRouter.post('/editmember', verify, editMember);
groupRouter.post('/delmember', verify, delMember);

export default groupRouter;
