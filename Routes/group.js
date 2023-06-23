import { Router } from 'express';
import {
  createGroup,
  editGroup,
  getGroupData,
  getGroupMenuData,
  joinGroup,
} from '../Controllers/Group/group.js';
import { getChatroom } from '../Controllers/Group/chatroom.js';
import {
  getRole,
  addRole,
  editRole,
  delRole,
} from '../Controllers/Group/role.js';
import {
  getMyMember,
  getMember,
  editMember,
  delMember,
} from '../Controllers/Group/member.js';
import { verify } from '../jwt.js';
import multer from 'multer';

const groupRouter = Router();
const storage = new multer.memoryStorage();
const upload = multer({ storage });

//Group
groupRouter.post('/createGroup', verify, upload.single('pic'), createGroup);
groupRouter.post('/editgroup', verify, upload.single('pic'), editGroup);
groupRouter.post('/joinGroup', verify, joinGroup);
groupRouter.get('/getGroupMenuData', verify, getGroupMenuData);
groupRouter.get('/getGroupData', verify, getGroupData);

//Chatroom
groupRouter.get('/getChatroom', verify, getChatroom);

//Role
groupRouter.get('/getRole', verify, getRole);
groupRouter.post('/addRole', verify, addRole);
groupRouter.post('/editrole', verify, editRole);
groupRouter.post('/delrole', verify, delRole);

//Member
groupRouter.get('/getMyMember', verify, getMyMember);
groupRouter.get('/getMember', verify, getMember);
groupRouter.post('/editmember', verify, editMember);
groupRouter.post('/delmember', verify, delMember);

export default groupRouter;
