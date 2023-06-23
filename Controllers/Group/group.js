import { v2 } from 'cloudinary';
import expressAsyncHandler from 'express-async-handler';
import { nanoid } from 'nanoid';
import {
  groupDataModel,
  groupRoomsRolesAndMembersModel,
  chatroomModel,
  roleModel,
  memberModel,
} from '../../Models/group.js';
import { userProfileModel } from '../../Models/user.js';

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

const editGroup = expressAsyncHandler(async (req, res) => {
  const { name, bio, memberid, id } = req.body;
  try {
    const member = await memberModel.findById(memberid);
    const memberRole = await roleModel.findById(member.role);
    if (memberRole.tier < 4)
      return res.status(500).send("You don't have the permission to do that!");
    let updateData;
    let pic;
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
      pic = await v2.uploader.upload(dataURI, {
        folder: 'gpp',
        resource_type: 'auto',
        upload_preset: 'gpp',
        public_id: id,
      });
    }
    if (memberRole.tier === 4) {
      updateData = !pic
        ? {
            bio,
          }
        : { bio, pic: pic.secure_url };
    } else {
      updateData = !pic ? { name, bio } : { name, bio, pic: pic.secure_url };
    }
    const group = await groupDataModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    return res.status(200).json(group);
  } catch (error) {
    return res
      .status(500)
      .send('Could not Edit group, please try again: ' + error);
  }
});

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

export { createGroup, getGroupData, getGroupMenuData, joinGroup, editGroup };
