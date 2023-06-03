import { Schema } from 'mongoose';
import db from '../db.js';

const groupData = new Schema(
  {
    pic: {
      type: String,
    },
    groupid: {
      type: String,
      required: [true, 'Group Id is required!'],
      unique: [true, 'Group Id has to be unique!'],
      maxLength: 20,
    },
    name: {
      type: String,
      required: [true, 'Group name is required!'],
      maxLength: 40,
    },
    bio: {
      type: String,
      default: '',
      maxLength: 175,
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: 'members',
      required: [true, 'Group Admin is required!'],
    },
  },
  {
    timestamps: true,
  }
);

const groupRoomsRolesAndMembers = new Schema({
  groupid: {
    type: Schema.Types.ObjectId,
    ref: 'group_data',
    required: [true, 'Group Id is required!!'],
    unique: [true, 'Group Id has to be unique!'],
  },
  rooms: [{ type: Schema.Types.ObjectId, ref: 'chatrooms' }],
  members: [{ type: Schema.Types.ObjectId, ref: 'members' }],
  roles: [{ type: Schema.Types.ObjectId, ref: 'roles' }],
});

const chatroom = new Schema({
  groupid: {
    type: Schema.Types.ObjectId,
    ref: 'group_data',
    required: [true, 'Group Id is required!!'],
  },
  name: {
    type: String,
    required: [true, 'Chatroom name is required!!'],
  },
  accessRoles: [{ type: Schema.Types.ObjectId, ref: 'roles' }],
});

const role = new Schema({
  groupid: {
    type: Schema.Types.ObjectId,
    ref: 'group_data',
    required: [true, 'Group Id is required!!'],
  },
  name: {
    type: String,
    required: [true, 'Role name is required!!'],
  },
  tier: {
    type: Number,
    required: [true, 'Role Tier is required!!'],
  },
});

const member = new Schema({
  groupid: {
    type: Schema.Types.ObjectId,
    ref: 'group_data',
    required: [true, 'Group Id is required!!'],
  },
  userid: {
    type: Schema.Types.ObjectId,
    ref: 'user_data',
    required: [true, 'User ID is required!'],
  },
  role: {
    type: Schema.Types.ObjectId,
    ref: 'roles',
    required: [true, 'Role is required!'],
  },
});

const groupdb = db.useDb('group');
const groupRoomsRolesAndMembersModel = groupdb.model(
  'group_rrm',
  groupRoomsRolesAndMembers
);
const chatroomModel = groupdb.model('chatrooms', chatroom);
const roleModel = groupdb.model('roles', role);
const memberModel = groupdb.model('members', member);

const groupDataModel = groupdb.model('group_data', groupData);

export {
  groupDataModel,
  groupRoomsRolesAndMembersModel,
  chatroomModel,
  roleModel,
  memberModel,
};
