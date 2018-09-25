const express = require("express");
const User = require("../models/user");
const mongoose = require("mongoose");

const router = express.Router();

router.post("/", (req, res, next) => {
  const { username, password, fullName } = req.body;

  const requiredFields = ['username', 'password'];
  const missingField = requiredFields.find(field => !(field in req.body));
  if (missingField) {
      return res.status(422).json({
          code: 422,
          reason: 'ValidationError',
          message: 'Missing Field',
          location: missingField
      });
  }
  const stringFields = ['username', 'password', 'fullName'];
  const nonStringField = stringFields.find(
      field => field in req.body && typeof req.body[field] !== 'string'
  );
  if (nonStringField) {
      return res.status(422).json({
          code: 422,
          reason: 'ValidationError',
          message: 'Incorrect field type: expected string',
          location: nonStringField
      });
  }

  const explicityTrimmedFields = ['username', 'password'];
  const nonTrimmedField = explicityTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    });
  }

  const sizedFields = {
    username: {
      min: 1
    },
    password: {
      min: 8,
      max: 72
    }
  };
  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      'min' in sizedFields[field] &&
            req.body[field].trim().length < sizedFields[field].min
  );
  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      'max' in sizedFields[field] &&
            req.body[field].trim().length > sizedFields[field].max
  );

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField]
          .min} characters long`
        : `Must be at most ${sizedFields[tooLargeField]
          .max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }

  return User.find({ username })
    .count()
    .then(count => {
      if (count > 0) {
        return Promise.reject({
          code: 422,
          reason: "ValidationError",
          message: "Username already taken",
          location: "username"
        });
      }
      return User.hashPassword(password);
    })
    .then(digest => {
      return User.create({
        username,
        password: digest,
        fullName
      });
    })
    .then(result => {
      return res
        .status(201)
        .location(`/api/users/${result.id}`)
        .json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error("The username already exists");
        err.status = 400;
      }
      next(err);
    });
});

module.exports = router;
