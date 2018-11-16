const express = require('express');
const errorHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const authCtrl = require('../controllers/auth.controller');

const router = express.Router();

const isAuthenticated = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({
      error: null,
      msg: 'Please login first to access our app',
      data: null,
    });
  }
  jwt.verify(token, req.app.get('secret'), (err, decodedToken) => {
    if (err) {
      return res.status(401).json({
        error: err,
        msg: 'Login timed out, please login again.',
        data: null,
      });
    }
    req.decodedToken = decodedToken;
    next();
  });
};

const isNotAuthenticated = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    next();
  } else {
    jwt.verify(token, req.app.get('secret'), (err, decodedToken) => {
      if (!err) {
        return res.status(403).json({
          error: err,
          msg: 'You are already logged in.',
          data: null,
        });
      }
      next();
    });
  }
};

// -------------------------------Auth------------------------------------------
router.post('/auth/signup', isNotAuthenticated, errorHandler(authCtrl.signup));
router.post('/auth/login', isNotAuthenticated, errorHandler(authCtrl.login));

router.patch(
  '/auth/resendVerificationEmail',
  errorHandler(authCtrl.resendVerificationEmail),
);
router.patch(
  '/auth/verifyAccount/:verificationToken',
  errorHandler(authCtrl.verifyAccount),
);

module.exports = router;
