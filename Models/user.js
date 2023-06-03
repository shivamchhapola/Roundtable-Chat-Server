import { Schema } from 'mongoose';
import db from '../db.js';
import bcrypt from 'bcryptjs';

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required!'],
      unique: [true, 'Username has to be unique!'],
      maxLength: 20,
    },
    name: {
      type: String,
      required: [true, 'Name is required!'],
      maxLength: 40,
    },
    email: {
      type: String,
      required: [true, 'Email is required!'],
      unique: [true, 'Email has to be unique!'],
      maxLength: 500,
    },
    password: {
      type: String,
      required: [true, 'Password is required!'],
      maxLength: 150,
    },
  },
  {
    timestamps: true,
  }
);

const userProfileSchema = new Schema({
  userid: {
    type: Schema.Types.ObjectId,
    ref: 'user_data',
    required: [true, 'Username is required!'],
    unique: [true, 'Username has to be unique!'],
  },
  bio: {
    type: String,
    default: '',
    maxLength: 175,
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
    maxLength: 25,
  },
  link: {
    type: String,
    default: '',
    maxLength: 250,
  },
  groups: [{ type: Schema.Types.ObjectId }],
  chats: [{ type: Schema.Types.ObjectId }],
  blocked: [{ type: Schema.Types.ObjectId }],
});

userSchema.methods.matchPass = async function (password) {
  let match = false;
  await bcrypt.compare(password, this.password).then((res) => (match = res));
  return match;
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const userdb = db.useDb('user');
const userModel = userdb.model('user_data', userSchema);
const userProfileModel = userdb.model('user_profile', userProfileSchema);

export { userModel, userProfileModel };
