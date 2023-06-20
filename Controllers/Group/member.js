import expressAsyncHandler from 'express-async-handler';
import {
  groupRoomsRolesAndMembersModel,
  roleModel,
  memberModel,
} from '../../Models/group.js';
import { userModel, userProfileModel } from '../../Models/user.js';

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

const editMember = expressAsyncHandler(async (req, res) => {
  const id = req.body.id;
  const roleid = req.body.roleid;
  const reqMemberid = req.body.memberid;
  try {
    const member = await memberModel.findById(id);
    const memberRole = await roleModel.findById(member.role);
    const reqMember = await memberModel.findById(reqMemberid);
    const reqMemberRole = await roleModel.findById(reqMember.role);
    const toRole = await roleModel.findById(roleid);
    if (toRole.tier === 5)
      return res.status(500).send('There can only be one Tier 5!');
    if (reqMemberRole.tier <= memberRole.tier || reqMemberRole.tier <= 2)
      return res.status(500).send("You don't have the permission to do that!");
    await memberModel.findByIdAndUpdate(id, {
      role: roleid,
    });
    return res.send(200).sendStatus('Member Updated!');
  } catch (error) {
    return res.status(500).send("Couldn't Edit Role Data: " + error);
  }
});

const delMember = expressAsyncHandler(async (req, res) => {
  const id = req.body.id;
  const gid = req.body.gid;
  const reqMemberid = req.body.memberid;

  try {
    const member = await memberModel.findById(id);
    const memberRole = await roleModel.findById(member.role);
    const reqMember = await memberModel.findById(reqMemberid);
    const reqMemberRole = await roleModel.findById(reqMember.role);
    if (reqMemberRole.tier <= memberRole.tier || reqMemberRole.tier <= 2)
      return res.status(500).send("You don't have the permission to do that!");
    const deletedMember = await memberModel.findByIdAndRemove(id);
    await groupRoomsRolesAndMembersModel.findOneAndUpdate(
      { groupid: gid },
      { $pull: { members: id } }
    );
    const temp = await userProfileModel.findOneAndUpdate(
      { userid: member.userid },
      {
        $pull: { groups: member.groupid },
      }
    );
    return res.status(200).json(deletedMember);
  } catch (error) {
    return res.status(500).send("Couldn't Delete Role Data: " + error);
  }
});

export { getMyMember, getMember, editMember, delMember };
