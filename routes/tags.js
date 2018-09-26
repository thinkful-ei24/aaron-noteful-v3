const express = require("express");
const Tag = require("../models/tags");
const Note = require("../models/note");
const mongoose = require("mongoose");
const passport = require('passport');

const router = express.Router();

router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

router.get("/", (req, res, next) => {
  let searchTerm = req.query.searchTerm;
  let userId = req.user.id;
  if (searchTerm) {
    return Tag.find({ userId, name: { $regex: searchTerm, $options: "i" } })
      .sort("name")
      .then(results => {
        res.json(results);
      })
      .catch(err => {
        console.error(`ERROR: ${err.message}`);
        console.error(err);
        next(err);
      });
  }
  if (!searchTerm) {
    return Tag.find({ userId })
      .sort("name")
      .then(results => {
        res.json(results);
      })
      .catch(err => {
        console.error(`ERROR: ${err.message}`);
        console.error(err);
        next(err);
      });
  }
});

router.get("/:id", (req, res, next) => {
  let id = req.params.id;
  let userId = req.user.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error("The `id` is not valid");
    err.status = 400;
    return next(err);
  }
  Tag.findOne({ _id: id, userId })
    .then(results => {
      if (results) {
        res.json(results);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

router.post("/", (req, res, next) => {
  const newObj = {
    name: req.body.name,
    userId: req.user.id
  };
  if (!newObj.name) {
    const err = new Error("Missing `name` in req body");
    err.status = 400;
    return next(err);
  }
  return Tag.create(newObj)
    .then(results => {
      res.location(`${req.originalUrl}/${results.id}`);
      res.status(201).json(results);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error("That tag name already exists");
        err.status = 400;
      }
      next(err);
    });
});

router.put("/:id", (req, res, next) => {
  const id = req.params.id;
  const userId = req.user.id;
  const newObj = {
    name: req.body.name
  };
  if (!newObj.name) {
    const err = new Error("Must provide a `name` in req body");
    err.status = 400;
    return next(err);
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error("The `id` is not valid");
    err.status = 400;
    return next(err);
  }
  return Tag.findOneAndUpdate({ _id: id, userId }, newObj, { new: true })
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error("That tag name already exists");
        err.status = 400;
      }
      next(err);
    });
});

router.delete("/:id", (req, res, next) => {
  const id = req.params.id;
  const userId = req.user.id;
  return Tag.findOneAndRemove({ _id: id, userId })
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error(err);
    });
});

module.exports = router;
