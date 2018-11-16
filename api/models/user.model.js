const mongoose = require('mongoose');

var taskSchema = mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  comment: String,
  done: {
    type: Boolean,
    default: false
  },
  dueDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

var todoSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  tasks: [taskSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  resetPasswordToken: String,
  resetPasswordTokenExpiry: Date,
  verificationToken: String,
  verificationTokenExpiry: Date,
  verified: {
    type: Boolean,
    default: false,
  },
  todos: [todoSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

if (!userSchema.options.toObject) userSchema.options.toObject = {};

userSchema.options.toObject.transform = (doc, ret) => {
  delete ret.password;
  delete ret.resetPasswordToken;
  delete ret.resetPasswordTokenExpiry;
  delete ret.verificationToken;
  delete ret.verificationTokenExpiry;
  return ret;
};

mongoose.model('User', userSchema);
