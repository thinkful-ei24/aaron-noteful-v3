const express = require("express");
const router = express.Router();
const passport = require('passport');
const JWT = require('jsonwebtoken');

const config = require('../config');
const { JWT_SECRET, JWT_EXPIRY } = config;

const options = { session: false, failWithError: true };

const localAuth = passport.authenticate("local", options);

function createAuthToken(user) {
  return JWT.sign({ user }, JWT_SECRET, {
    subject: user.username,
    expiresIn: JWT_EXPIRY
  });
}

const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });

router.post('/refresh', jwtAuth, (req, res) => {
  const authToken = createAuthToken(req.user);
  res.json({ authToken });
});

router.post("/", localAuth, function(req, res) {
  const authToken = createAuthToken(req.user);
  res.json({ authToken });
});

module.exports = router;
