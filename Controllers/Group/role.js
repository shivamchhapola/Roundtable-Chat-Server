import expressAsyncHandler from 'express-async-handler';
import {
  groupRoomsRolesAndMembersModel,
  roleModel,
  memberModel,
} from '../../Models/group.js';

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
    if (tier === 5) {
      return res.status(500).send('There can only be one Tier 5!');
    }
    if (memberRole.tier < 5)
      return res.status(500).send("You don't have the permission to do that!");
    if (groupRRM.roles.length >= 15)
      return res.status(500).send('You can not add more roles!');
    const newRole = await roleModel.create({ groupid, name, tier });
    await groupRoomsRolesAndMembersModel.findOneAndUpdate(
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

const editRole = expressAsyncHandler(async (req, res) => {
  const id = req.body.id;
  const name = req.body.name;
  const tier = req.body.tier;
  const memberid = req.body.memberid;

  try {
    const member = await memberModel.findById(memberid);
    const memberRole = await roleModel.findById(member.role);
    const todrole = await roleModel.findById(id);
    if (todrole.tier === 5 && tier !== 5)
      return res.status(500).send("You can't do that!");
    if (memberRole.tier < 4)
      return res.status(500).send("You don't have the permission to do that!");
    const role = await roleModel.findByIdAndUpdate(id, { name, tier });
    return res.status(200).json(role);
  } catch (error) {
    return res.status(500).send("Couldn't Edit Role Data: " + error);
  }
});

const delRole = expressAsyncHandler(async (req, res) => {
  const id = req.body.id;
  const gid = req.body.gid;
  const memberid = req.body.memberid;

  try {
    const member = await memberModel.findById(memberid);
    const memberRole = await roleModel.findById(member.role);
    const todrole = await roleModel.findById(id);
    if (todrole.tier >= 5) return res.status(500).send("You can't do that!");
    if (memberRole.tier < 5)
      return res.status(500).send("You don't have the permission to do that!");
    const role = await roleModel.findByIdAndRemove(id);
    await groupRoomsRolesAndMembersModel.findOneAndUpdate(
      { groupid: gid },
      { $pull: { roles: id } }
    );
    return res.status(200).json(role);
  } catch (error) {
    return res.status(500).send("Couldn't Delete Role Data: " + error);
  }
});

export { getRole, addRole, editRole, delRole };
