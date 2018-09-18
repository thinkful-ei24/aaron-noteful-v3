"use strict";

const express = require("express");
const mongoose = require("mongoose");
const { MONGODB_URI } = require("../config");
const Note = require("../models/note");

const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get("/", (req, res, next) => {
  let searchTerm = req.query.searchTerm;

  if (searchTerm) {
    mongoose
      .connect(
        MONGODB_URI,
        { useNewUrlParser: true }
      )
      .then(() => {
        return Note.find({
          $or: [
            { title: { $regex: searchTerm, $options: "i" } },
            { content: { $regex: searchTerm, $options: "gi" } }
          ]
        });
      })
      .then(results => {
        res.json(results);
      })
      .then(() => {
        return mongoose.disconnect();
      })
      .catch(err => {
        console.error(`ERROR: ${err.message}`);
        console.error(err);
      });
  }
  if (!searchTerm) {
    mongoose
      .connect(
        MONGODB_URI,
        { useNewUrlParser: true }
      )
      .then(() => {
        return Note.find();
      })
      .then(results => {
        res.json(results);
      })
      .then(() => {
        return mongoose.disconnect();
      })
      .catch(err => {
        console.error(`ERROR: ${err.message}`);
        console.error(err);
      });
  }

  // res.json([
  //   { id: 1, title: 'Temp 1' },
  //   { id: 2, title: 'Temp 2' },
  //   { id: 3, title: 'Temp 3' }
  // ]);
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get("/:id", (req, res, next) => {
  let id = req.params.id;
  console.log(id);
  mongoose
    .connect(
      MONGODB_URI,
      { useNewUrlParser: true }
    )
    .then(() => {
      let filter = {};

      if (id) {
        filter.id = { _id: id };
      }

      return Note.findById(filter.id, (err, user) => {
        if (err) {
          console.log("no id");
        } else {
          return user;
        }
      });
    })
    .then(results => {
      res.json(results);
    })
    .then(() => {
      return mongoose.disconnect();
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error(err);
    });
});

/* ========== POST/CREATE AN ITEM ========== */
router.post("/", (req, res, next) => {
  const newObj = {
    title: req.body.title,
    content: req.body.content
  };

  if (!newObj.title || !newObj.content) {
    console.log("Must input Title and Content");
  }

  mongoose
    .connect(
      MONGODB_URI,
      { useNewUrlParser: true }
    )
    .then(() => {
      return Note.create(newObj);
    })
    .then(results => {
      res.json(results);
    })
    .then(() => {
      return mongoose.disconnect();
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error(err);
    });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put("/:id", (req, res, next) => {
  const id = req.params.id;
  const newObj = {
    title: req.body.title,
    content: req.body.content
  };

  mongoose
    .connect(
      MONGODB_URI,
      { useNewUrlParser: true }
    )
    .then(() => {
      return Note.findByIdAndUpdate(id, newObj, { new: true });
    })
    .then(results => {
      res.json(results);
    })
    .then(() => {
      return mongoose.disconnect();
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error(err);
    });
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete("/:id", (req, res, next) => {

  const id = req.params.id;
  mongoose
    .connect(
      MONGODB_URI,
      { useNewUrlParser: true }
    )
    .then(() => {
      return Note.findByIdAndRemove(id);
    })
    .then((results) => {
      res.json(results);
    })
    .then(() => {
      return mongoose.disconnect();
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error(err);
    });
});

module.exports = router;
