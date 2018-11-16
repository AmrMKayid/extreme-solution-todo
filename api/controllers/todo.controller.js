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

module.exports.createToDo = function(req, res, next) {
  var valid = req.body.name && Validations.isString(req.body.name);
  if (!valid) {
    return res.status(422).json({
      err: null,
      msg: 'name is a required field.',
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
    var newTodoName = req.body.name.trim().toLowerCase();
    var todoNameExists = user.todos.some(function(todo) {
      return todo.name == newTodoName;
    });
    if (todoNameExists) {
      return res.status(409).json({
        err: null,
        msg:
          'A todo with the same name "' +
          newTodoName +
          '" already exists, please try another name.',
        data: null
      });
    }

    // Security Check
    delete req.body.tasks;
    delete req.body.createdAt;
    delete req.body.updatedAt;

    var newTodo = user.todos.create(req.body);
    user.todos.push(newTodo);
    user.save(function(err) {
      if (err) {
        return next(err);
      }
      res.status(201).json({
        err: null,
        msg: 'Todo was created successfully.',
        data: newTodo
      });
    });
  });
};

module.exports.updateToDoName = function(req, res, next) {
  if (!Validations.isObjectId(req.params.todoId)) {
    return res.status(422).json({
      err: null,
      msg: 'todoId parameter must be a valid ObjectId.',
      data: null
    });
  }
  var valid = req.body.name && Validations.isString(req.body.name);
  if (!valid) {
    return res.status(422).json({
      err: null,
      msg: 'name is a required field.',
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

    var newTodoName = req.body.name.trim().toLowerCase();
    var todoNameExists = user.todos.some(function(todo) {
      return todo.name == newTodoName && todo._id != req.params.todoId;
    });
    if (todoNameExists) {
      return res.status(409).json({
        err: null,
        msg:
          'A todo with the same name "' +
          newTodoName +
          '" already exists, please try another name.',
        data: null
      });
    }

    todo.name = newTodoName;
    todo.updatedAt = moment().toDate();

    user.save(function(err) {
      if (err) {
        return next(err);
      }
      res.status(200).json({
        err: null,
        msg: 'Todo name was updated successfully.',
        data: todo
      });
    });
  });
};

module.exports.createTask = function(req, res, next) {
  if (!Validations.isObjectId(req.params.todoId)) {
    return res.status(422).json({
      err: null,
      msg: 'todoId parameter must be a valid ObjectId.',
      data: null
    });
  }
  var valid =
    req.body.description &&
    Validations.isString(req.body.description) &&
    (req.body.dueDate ? Validations.isDate(req.body.dueDate) : true);

  if (!valid) {
    return res.status(422).json({
      err: null,
      msg:
        'description(String) is a required field, dueDate(Date) is optional but has to be a valid date, done(Boolean) is optional but has to be a valid boolean.',
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
        .json({ err: null, msg: 'todo not found.', data: null });
    }
    // Security Check
    delete req.body.done;
    delete req.body.createdAt;
    delete req.body.updatedAt;

    var task = todo.tasks.create(req.body);
    todo.tasks.push(task);

    user.save(function(err) {
      if (err) {
        return next(err);
      }
      res.status(200).json({
        err: null,
        msg: 'Task was created successfully.',
        data: task
      });
    });
  });
};

module.exports.updateTask = function(req, res, next) {
  if (
    !Validations.isObjectId(req.params.todoId) &&
    Validations.isObjectId(req.params.taskId)
  ) {
    return res.status(422).json({
      err: null,
      msg: 'todoId and taskId parameters must be valid ObjectIds.',
      data: null
    });
  }
  var valid =
    req.body.description &&
    Validations.isString(req.body.description) &&
    (req.body.dueDate ? Validations.isDate(req.body.dueDate) : true) &&
    (req.body.done ? Validations.isBoolean(req.body.done) : true);
  if (!valid) {
    return res.status(422).json({
      err: null,
      msg:
        'description(String) is a required field, dueDate(Date) is optional but has to be a valid date, done(Boolean) is optional but has to be a valid boolean.',
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
        .json({ err: null, msg: 'todo not found.', data: null });
    }

    var task = todo.tasks.id(req.params.taskId);
    if (!task) {
      return res
        .status(404)
        .json({ err: null, msg: 'Task not found.', data: null });
    }
    task.description = req.body.description;
    task.dueDate = req.body.dueDate || task.dueDate;
    task.done = req.body.done !== null ? req.body.done : task.done;
    task.updatedAt = moment().toDate();

    user.save(function(err) {
      if (err) {
        return next(err);
      }
      res.status(200).json({
        err: null,
        msg: 'Task was updated successfully.',
        data: task
      });
    });
  });
};