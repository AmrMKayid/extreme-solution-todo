const mongoose = require('mongoose');
const moment = require('moment');
const Validations = require('../utils/validations');

const User = mongoose.model('User');

module.exports.getToDos = function(req, res, next) {
  User.findById(req.decodedToken.user._id).exec(function(err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res
        .status(404)
        .json({ err: null, msg: 'User not found.', data: null });
    }
    res.status(200).json({
      err: null,
      msg: 'All ToDos retrieved successfully.',
      data: user.todos
    });
  });
};

module.exports.getToDo = function(req, res, next) {
  if (!Validations.isObjectId(req.params.todoId)) {
    return res.status(422).json({
      err: null,
      msg: 'todoId parameter must be a valid ObjectId.',
      data: null
    });
  }
  User.findById(req.decodedToken.user._id).exec(function(err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res
        .status(404)
        .json({ err: null, msg: 'User not found.', data: null });
    }

    var todo = user.todos.id(req.params.todoId);
    if (!todo) {
      return res
        .status(404)
        .json({ err: null, msg: 'Todo not found.', data: null });
    }

    res.status(200).json({
      err: null,
      msg: 'Todo retrieved successfully.',
      data: todo
    });
  });
};
