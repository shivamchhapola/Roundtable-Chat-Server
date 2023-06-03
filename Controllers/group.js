import { v2 } from 'cloudinary';
import expressAsyncHandler from 'express-async-handler';
import { nanoid } from 'nanoid';
import {
  groupDataModel,
  groupRoomsRolesAndMembersModel,
  chatroomModel,
  roleModel,
  memberModel,
} from '../Models/group.js';
import { userModel, userProfileModel } from '../Models/user.js';

//Create Group Backend
const createGroup = expressAsyncHandler(async (req, res) => {
  try {
    const groupid = nanoid(10);
    const groupData = await groupDataModel.create({
      groupid,
      name: req.body.name,
      bio: req.body.bio,
      admin: req.user.id,
      pic: '',
    });
    const adminrole = await roleModel.create({
      groupid: groupData._id,
      name: 'admin',
      tier: 5,
    });
    const memberrole = await roleModel.create({
      groupid: groupData._id,
      name: 'member',
      tier: 1,
    });
    const admin = await memberModel.create({
      groupid: groupData._id,
      userid: req.user.id,
      role: adminrole._id,
    });
    let pic;
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
      pic = await v2.uploader.upload(dataURI, {
        folder: 'gpp',
        resource_type: 'auto',
        upload_preset: 'gpp',
        public_id: groupData._id,
      });
    }
    const updatedgroup = await groupDataModel.findByIdAndUpdate(groupData._id, {
      admin: admin._id,
      pic: pic ? pic.secure_url : '',
    });
    const chatroom = await chatroomModel.create({
      groupid: groupData._id,
      name: 'general',
      accessRoles: [adminrole._id, memberrole._id],
    });
    const grouprrm = await groupRoomsRolesAndMembersModel.create({
      groupid: groupData._id,
      rooms: [chatroom._id],
      members: [admin._id],
      roles: [adminrole._id, memberrole._id],
    });
    const updatedprofile = await userProfileModel.updateOne(
      { userid: req.user.id },
      { $addToSet: { groups: groupData._id } }
    );
    Promise.all([
      pic,
      groupData,
      adminrole,
      memberrole,
      admin,
      updatedgroup,
      grouprrm,
      updatedprofile,
    ]).then((yee) => {
      return res.status(200).send('Group Created!!!');
    });
  } catch (error) {
    return res
      .status(500)
      .send('Could not create group, please try again: ' + error);
  }
});

//Gets Basic Group data for Group List on frontend
const getGroupData = expressAsyncHandler(async (req, res) => {
  await groupDataModel
    .findById(req.query.id)
    .then((g) => {
      return res.status(200).json(g);
    })
    .catch((err) => {
      return res.status(500).send("Couldn't find group: " + err);
    });
});

//Gets More Detailed Group data for group menu or chatroom list
const getGroupMenuData = expressAsyncHandler(async (req, res) => {
  try {
    const groupdata = await groupDataModel.findById(req.query.id);
    const grouprrm = await groupRoomsRolesAndMembersModel.findOne({
      groupid: req.query.id,
    });
    return res.status(200).json({ GroupData: groupdata, GroupRRM: grouprrm });
  } catch (error) {
    return res.status(500).send("Couldn't Get Group Menu!" + error);
  }
});

//Gets Chatroom Data
const getChatroom = expressAsyncHandler(async (req, res) => {
  try {
    const chatroom = await chatroomModel.findById(req.query.id);
    return res.status(200).json(chatroom);
  } catch (error) {
    return res.status(500).send("Couldn't Get Chatroom!" + error);
  }
});

//Join Group Backend
const joinGroup = expressAsyncHandler(async (req, res) => {
  const groupid = req.body.groupid;
  try {
    const groupData = await groupDataModel.findOne({ groupid });
    const role = await roleModel.findOne({ groupid: groupData._id, tier: 1 });
    const member = await memberModel.create({
      userid: req.user.id,
      groupid: groupData._id,
      role: role._id,
    });
    await groupRoomsRolesAndMembersModel.findOneAndUpdate(
      {
        groupid: groupData._id,
      },
      { $addToSet: { members: member._id } }
    );
    await userProfileModel
      .updateOne(
        { userid: req.user.id },
        { $addToSet: { groups: groupData._id } }
      )
      .then((up) => {
        return res.status(200).send('Joined Group');
      });
  } catch (error) {
    return res.status(500).send("Couldn't join Group!" + error);
  }
});

//Gets user's member data and their role
const getMyMember = expressAsyncHandler(async (req, res) => {
  const userid = req.user.id;
  const groupid = req.query.groupid;
  try {
    const member = await memberModel.findOne({ userid, groupid });
    return res.status(200).json({
      memberId: member._id,
      roleId: member.role,
    });
  } catch (error) {
    return res.status(500).send("Couldn't Get Member Data: " + error);
  }
});

//Gets everyone else's member data
const getMember = expressAsyncHandler(async (req, res) => {
  const memberid = req.query.id;
  try {
    const member = await memberModel.findById(memberid);
    const user = await userModel.findById(member.userid);
    return res.status(200).json({
      name: user.name,
      userid: user._id,
      memberId: member._id,
      roleId: member.role,
    });
  } catch (error) {
    return res.status(500).send("Couldn't Get Member Data: " + error);
  }
});

const getRole = expressAsyncHandler(async (req, res) => {
  const roleid = req.query.id;
  try {
    const role = await roleModel.findById(roleid);
    return res.status(200).json({
      name: role.name,
      id: role._id,
      tier: role.tier,
    });
  } catch (error) {
    return res.status(500).send("Couldn't Get Role Data: " + error);
  }
});

const addRole = expressAsyncHandler(async (req, res) => {
  const groupid = req.body.groupid;
  const name = req.body.name;
  const tier = req.body.tier;
  const memberid = req.body.memberid;

  try {
    const member = await memberModel.findById(memberid);
    const memberRole = await roleModel.findById(member.role);
    const groupRRM = await groupRoomsRolesAndMembersModel.findOne({ groupid });
    if (memberRole.tier < 5)
      return res.status(500).send("You don't have the permission to do that!");
    if (groupRRM.roles.length >= 15)
      return res.status(500).send('You can not add more roles!');
    const newRole = await roleModel.create({ groupid, name, tier });
    await groupRoomsRolesAndMembersModel.updateOne(
      { groupid },
      { $addToSet: { roles: newRole._id } }
    );
    return res.status(200).json({
      name: newRole.name,
      id: newRole._id,
      tier: newRole.tier,
    });
  } catch (error) {
    return res.status(500).send("Couldn't Add Role Data: " + error);
  }
});

export {
  createGroup,
  getGroupData,
  getGroupMenuData,
  getChatroom,
  joinGroup,
  getMyMember,
  getMember,
  getRole,
  addRole,
};
