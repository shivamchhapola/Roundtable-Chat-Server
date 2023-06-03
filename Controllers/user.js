import { v2 } from 'cloudinary';
import expressAsyncHandler from 'express-async-handler';
import { userModel, userProfileModel } from '../Models/user.js';

//Get Profile data
const getMyProfile = expressAsyncHandler(async (req, res) => {
  await userModel
    .findById(req.user.id)
    .then((u) => {
      userProfileModel.findOne({ userid: u._id }).then((up) => {
        return res.status(200).json({
          id: u._id,
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

//Update User Profile
const updateMyProfile = expressAsyncHandler(async (req, res) => {
  let pic;
  let banner;
  let toUpdateInProfile = {
    bio: req.body.bio,
    link: req.body.link,
    contact: req.body.contact,
  };
  if (req.files) {
    req.files.forEach((file) => {
      if (file.fieldname === 'pic') pic = file;
      else if (file.fieldname === 'banner') banner = file;
    });

    if (pic) {
      let b64 = Buffer.from(pic.buffer).toString('base64');
      let dataURI = 'data:' + pic.mimetype + ';base64,' + b64;
      pic = await v2.uploader
        .upload(dataURI, {
          folder: 'pp',
          resource_type: 'auto',
          upload_preset: 'gpp',
          public_id: req.user.id,
        })
        .then((pic) => (toUpdateInProfile['pic'] = pic.secure_url));
    }

    if (banner) {
      let b64 = Buffer.from(banner.buffer).toString('base64');
      let dataURI = 'data:' + banner.mimetype + ';base64,' + b64;
      banner = await v2.uploader
        .upload(dataURI, {
          folder: 'banner',
          resource_type: 'auto',
          upload_preset: 'banner',
          public_id: req.user.id,
        })
        .then((ban) => {
          toUpdateInProfile['banner'] = ban.secure_url;
        });
    }
  }

  await userModel
    .findByIdAndUpdate(
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
        .findOneAndUpdate({ userid: u._id }, toUpdateInProfile, { new: true })
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

//Get Group ID List
const getMyGroups = expressAsyncHandler(async (req, res) => {
  await userProfileModel
    .findOne({ userid: req.user.id })
    .then((up) => {
      return res.status(200).json(up.groups);
    })
    .catch((err) => {
      return res.status(500).send("Couldn't find user groups: " + err);
    });
});

export { getMyProfile, updateMyProfile, getMyGroups };
