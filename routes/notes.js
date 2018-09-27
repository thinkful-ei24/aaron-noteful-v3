"use strict";

const express = require("express");
const Note = require("../models/note");
const mongoose = require("mongoose");
const passport = require("passport");

const router = express.Router();
const Folder = require("../models/folder");
const Tag = require("../models/tags");

/* ========== GET/READ ALL ITEMS ========== */

router.use(
  "/",
  passport.authenticate("jwt", { session: false, failWithError: true })
);

router.get("/", (req, res, next) => {
  let searchTerm = req.query.searchTerm;
  let folderId = req.query.folderId;
  let tagId = req.query.tagId;
  const userId = req.user.id;
  let filter = { userId };

  if (searchTerm) {
    const re = new RegExp(searchTerm, "i");
    filter.$or = [{ title: { $regex: re } }, { content: { $regex: re } }];
  }
  if (folderId) {
    filter.folderId = folderId;
  }
  if (tagId) {
    filter.tags = tagId;
  }
  Note.find(filter)
    .select("title content created folderId tags")
    .populate("tags")
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
  const userId = req.user.id;
  console.log(id);

  return Note.findOne({ _id: id, userId })
    .populate("tags")
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== POST/CREATE AN ITEM ========== */
router.post("/", (req, res, next) => {
  const newObj = {
    title: req.body.title,
    content: req.body.content,
    folderId: req.body.folderId,
    tags: req.body.tags,
    userId: req.user.id
  };

  if (!newObj.title || !newObj.content) {
    console.log("Must input Title and Content");
    const err = new Error("Missing title or content in req body");
    err.status = 400;
    return next(err);
  }

  // if (!mongoose.Types.ObjectId.isValid(newObj.folderId)) {
  //   const err = new Error("The `id` is not valid");
  //   err.status = 400;
  //   return next(err);
  // }

  // return Folder.count({ _id: newObj.folderId, userId }).then(count => {
  //   if (count === 0) {
  //     const err = new Error("The folderId is not valid");
  //     err.status = 400;
  //     return next(err);
  //   }
  // });

  // const validateTagId = (req, res, next) => {
  //   // Make sure `tags` is an array
  //   if (!Array.isArray(req.body.tags)) {
  //     const err = new Error("`tags` must be an array");
  //     err.status = 400;
  //     return next(err);
  //   }
  //   // Check to see if any tags need to be validated
  //   const tagsLength = req.body.tags.length;
  //   if (tagsLength === 0) return next();
  //   // Check for valid tags
  //   for (let i = 0; i < tagsLength; i++) {
  //     if (!idIsValid(req.body.tags[i])) {
  //       const err = new Error(`Invalid tag \`id\` parameter at index ${i}.`);
  //       err.status = 400;
  //       return next(err);
  //     }
  //   }
  //   // Skip step 2 validation if the request is redundant
  //   if (req.method === "GET" || req.method === "DELETE") return next();
  //   // Check to see if all tags being used exist
  //   const userId = req.user.id;
  //   return Tag.find({ _id: { $in: req.body.tags }, userId })
  //     .count()
  //     .then(tagCount => {
  //       if (tagCount !== tagsLength) {
  //         const err = new Error("An id in `tags` does not exist.");
  //         err.status = 404;
  //         return next(err);
  //       } else return next();
  //     })
  //     .catch(err => next(err));
  // };

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
  const userId = req.user.id;
  const folderId = req.body.folderId;
  const newObj = {
    title: req.body.title,
    content: req.body.content,
    folderId,
    tags: req.body.tags,
    userId: req.user.id
  };

  return Note.findOneAndUpdate({ _id: id, userId }, newObj, { new: true })
    .select("title content created folderId tags userId")
    .populate("tags")
    .then(results => {
      res.json(results);
    })

    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error(err);
      next();
    });
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete("/:id", (req, res, next) => {
  const id = req.params.id;
  const userId = req.user.id;

  return Note.findOneAndRemove({ _id: id, userId })

    .then(() => {
      res.status(204).end();
    })

    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error(err);
    });
});

module.exports = router;
