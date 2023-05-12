import expressAsyncHandler from 'express-async-handler';
import User from '../Models/user_data.js';
import userProfileModel from '../Models/user_profile.js';

const getMyProfile = expressAsyncHandler(async (req, res) => {
  await User.findById(req.user.id)
    .then((u) => {
      userProfileModel.findOne({ userid: u._id }).then((up) => {
        return res.status(200).json({
          username: u.username,
          name: u.name,
          email: u.email,
          bio: up.bio,
          pic: up.pic,
          banner: up.banner,
          contact: up.contact,
          link: up.link,
        });
      });
    })
    .catch((err) => {
      return res.status(500).send("Couldn't find the user: " + err);
    });
});

const updateMyProfile = expressAsyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user.id,
    {
      username: req.body.username,
      name: req.body.name,
      email: req.body.email,
    },
    { new: true }
  )
    .then((u) => {
      userProfileModel
        .findOneAndUpdate(
          { userid: u._id },
          {
            bio: req.body.bio,
            pic: req.body.pic,
            link: req.body.link,
            banner: req.body.banner,
            contact: req.body.contact,
          },
          { new: true }
        )
        .then((up) => {
          return res.status(200).json({
            username: u.username,
            name: u.name,
            email: u.email,
            bio: up.bio,
            pic: up.pic,
            banner: up.banner,
            contact: up.contact,
            link: up.link,
          });
        })
        .catch((err) => {
          return res.status(500).send("Couldn't update user: " + err);
        });
    })
    .catch((err) => {
      return res.status(500).send("Couldn't update user: " + err);
    });
});

export { getMyProfile, updateMyProfile };
