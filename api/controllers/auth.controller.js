const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const joi = require('joi');
const moment = require('moment');
const rand = require('rand-token');
const nodemailer = require('../config/nodemailer');
const Encryption = require('../utils/encryption');
const Validations = require('../utils/validations');
const config = require('../config');

const User = mongoose.model('User');

module.exports.signup = async (req, res) => {
  const schema = joi
    .object({
      firstName: joi
        .string()
        .trim()
        .required(),
      lastName: joi
        .string()
        .trim()
        .required(),
      username: joi
        .string()
        .trim()
        .lowercase()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
      email: joi
        .string()
        .trim()
        .lowercase()
        .email()
        .required(),
      password: joi
        .string()
        .trim()
        .min(8)
        .required(),
      confirmPassword: joi
        .string()
        .trim()
        .equal(req.body.password)
        .required(),
    })
    .options({
      stripUnknown: true,
    });
  const result = schema.validate(req.body);
  if (result.error) {
    return res.status(422).json({
      msg: result.error.details[0].message,
      err: null,
      data: null,
    });
  }
  const user = await User.findOne({
    $or: [
      {
        username: result.value.username,
      },
      {
        email: result.value.email,
      },
    ],
  })
    .lean()
    .exec();
  if (user) {
    return res.status(409).json({
      err: null,
      msg: 'Username or Email already exists, please choose another one!',
      data: null,
    });
  }
  Object.assign(result.value, {
    password: await Encryption.hashPassword(result.value.password),
    verificationToken: rand.generate(32),
    verificationTokenExpiry: moment()
      .add(24, 'hours')
      .toDate(),
  });
  const newUser = await User.create(result.value);
  await nodemailer.sendMail({
    from: config.MAILER_SENDER,
    to: newUser.email,
    subject: 'Account Verification',
    html: `<p>Hello ${
      newUser.username
    }, Welcome to ToDo App <br> please click on the following link to verify your account: <a href="${
      config.FRONTEND_URI
    }/verifyAccount/${result.value.verificationToken}">Verify</a></p>`,
  });
  res.status(201).json({
    err: null,
    msg: `Welcome, ${newUser.username}, your registration was successful! enjoy our app! :))`,
    data: null,
  });
};

module.exports.login = async (req, res) => {
  const schema = joi
    .object({
      username: joi
        .string()
        .trim()
        .lowercase()
        .required(),
      password: joi
        .string()
        .trim()
        .required(),
    })
    .options({ stripUnknown: true });
  const result = schema.validate(req.body);
  if (result.error) {
    return res.status(422).json({
      err: null,
      msg: result.error.details[0].message,
      data: null,
    });
  }
  const user = await User.findOne({
    username: result.value.username,
  }).exec();
  if (!user) {
    return res
      .status(404)
      .json({ err: null, msg: 'Account not found.', data: null });
  }
  const passwordMatches = await Encryption.comparePasswordToHash(
    result.value.password,
    user.password,
  );
  if (!passwordMatches) {
    return res
      .status(401)
      .json({ err: null, msg: 'Password is incorrect.', data: null });
  }
  const token = jwt.sign(
    {
      user: user.toObject(),
    },
    config.SECRET,
    {
      expiresIn: '24h',
    },
  );
  res.status(200).json({
    err: null,
    msg: `Welcome, ${user.username}.`,
    data: token,
  });
};
