import asyncHandler from 'express-async-handler';
import Joi from 'joi';
import { joiPasswordExtendCore } from 'joi-password';
import { nanoid } from 'nanoid';
import { userModel, userProfileModel } from '../Models/user.js';
import { generateToken } from '../jwt.js';

const joiPassword = Joi.extend(joiPasswordExtendCore);

const validationSchema = Joi.object({
  username: Joi.string().required().min(1).max(20),
  name: Joi.string().required().max(30),
  email: Joi.string()
    .required()
    .email({ tlds: { allow: false } }),
  password: joiPassword
    .string()
    .min(8)
    .max(150)
    .minOfLowercase(1)
    .minOfUppercase(1)
    .minOfNumeric(1),
});

//Register
const register = asyncHandler(async (req, res) => {
  let { name, email, password } = req.body;
  //provides a randomly generated username if not provided in the request body.
  let username = req.body.username || nanoid(10);

  //Empty fields check
  if (!name) return res.status(500).send('"name" not found');
  if (!email) return res.status(500).send('"email" not found');
  if (!password) return res.status(500).send('"password" not found');

  username = username.toLowerCase();
  email = email.toLowerCase();

  //Packs the data in a single variable
  const data = { username, name, email, password };

  //Joi Validation using the Schema created above
  const validate = validationSchema.validate(data);
  if (validate.error)
    return res.status(400).send(validate.error.details[0].message);

  //Checks if the Email already exists in the DB
  const alreadyExists = await userModel.findOne({ email });
  if (alreadyExists)
    return res.status(400).send('An account with this Email already exists');

  //Inserts the data into User collection
  const user = await userModel.create(data).catch((err) => {
    return res.status(500).send('Could not create an account: ' + err);
  });
  if (user) {
    await userProfileModel.create({ userid: user._id }).catch((err) => {
      return res.status(501).send('Error Creating user Profile: ' + err);
    });
    return res.status(200).send(generateToken(user._id));
  }
});

//Login
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  //Empty fields check
  if (!username) return res.status(500).send('"username" not found in body');
  if (!password) return res.status(500).send('"password" not found in body');

  //Check if the provided value in the username field is an Email address
  const isEmail = Joi.string()
    .email({ tlds: { allow: false } })
    .validate(username).error
    ? false
    : true;

  //Finds an user with the provided Email
  const user = await userModel.findOne(
    isEmail ? { email: username } : { username }
  );

  if (!user)
    return res
      .status(500)
      .send('Could not find an account with given Username/Email');

  const match = await user.matchPass(password);
  return match
    ? res.status(200).send(generateToken(user._id))
    : res.status(400).send('Incorrect Password or Username/Email');
});

export { register, login };
