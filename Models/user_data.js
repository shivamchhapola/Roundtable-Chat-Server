import { Schema } from 'mongoose';
import db from '../db.js';
import bcrypt from 'bcryptjs';

const userSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Username is required!'],
    unique: [true, 'Username has to be unique!'],
  },
  name: {
    type: String,
    required: [true, 'Name is required!'],
  },
  email: {
    type: String,
    required: [true, 'Email is required!'],
    unique: [true, 'Email has to be unique!'],
  },
  password: {
    type: String,
    required: [true, 'Password is required!'],
  },
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

export default userModel;
