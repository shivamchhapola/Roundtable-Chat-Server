import { Schema } from 'mongoose';
import db from '../db.js';

const userProfileSchema = new Schema({
  userid: {
    type: Schema.Types.ObjectId,
    required: [true, 'Username is required!'],
    unique: [true, 'Username has to be unique!'],
  },
  bio: {
    type: String,
    default: '',
  },
  pic: {
    type: String,
    default: '',
  },
  banner: {
    type: String,
    default: '',
  },
  contact: {
    type: String,
    default: '',
  },
  link: {
    type: String,
    default: '',
  },
  groups: [{ type: Schema.Types.ObjectId }],
  chats: [{ type: Schema.Types.ObjectId }],
  blocked: [{ type: Schema.Types.ObjectId }],
});

const userdb = db.useDb('user');
const userProfileModel = userdb.model('user_profile', userProfileSchema);

export default userProfileModel;
