import expressAsyncHandler from 'express-async-handler';
import {
  groupDataModel,
  groupRoomsRolesAndMembersModel,
  chatroomModel,
  roleModel,
  memberModel,
} from '../../Models/group.js';

const getChatroom = expressAsyncHandler(async (req, res) => {
  try {
    const chatroom = await chatroomModel.findById(req.query.id);
    return res.status(200).json(chatroom);
  } catch (error) {
    return res.status(500).send("Couldn't Get Chatroom!" + error);
  }
});

export { getChatroom };
