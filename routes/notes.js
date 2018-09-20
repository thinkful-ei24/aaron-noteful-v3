"use strict";

const express = require("express");
const Note = require("../models/note");
const mongoose = require('mongoose');

const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get("/", (req, res, next) => {
  let searchTerm = req.query.searchTerm;
  let folderId = req.query.folderId;
  let filter = {};

  if (searchTerm) {
    const search = new RegExp(searchTerm, "i");
    filter.title = { $regex: search };
  }
  if (folderId) {
    filter.folderId = folderId;
  }
  Note.find(filter) 
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get("/:id", (req, res, next) => {
  let id = req.params.id;
  console.log(id);

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
  })

    .then(results => {
      res.json(results);
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
    content: req.body.content,
    folderId: req.body.folderId
  };

  if (!newObj.title || !newObj.content) {
    console.log("Must input Title and Content");
  }

  // if (!mongoose.Types.ObjectId.isValid(newObj.folderId)) {
  //   const err = new Error("The `id` is not valid");
  //   err.status = 400;
  //   return next(err);
  // }

  return Note.create(newObj)

    .then(results => {
      res.location(`${req.originalUrl}/${results.id}`);
      res.status(201).json(results);
    })

    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error(err);
    });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put("/:id", (req, res, next) => {
  const id = req.params.id;
  const folderId = req.body.folderId;
  const newObj = {
    title: req.body.title,
    content: req.body.content,
    folderId
  };

  return Note.findByIdAndUpdate(id, newObj, { new: true })

    .then(results => {
      res.json(results);
    })

    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error(err);
    });
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete("/:id", (req, res, next) => {
  const id = req.params.id;

  return Note.findByIdAndRemove(id)

    .then(results => {
      res.status(204).end();
    })

    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error(err);
    });
});

module.exports = router;
