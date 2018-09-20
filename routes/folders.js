const express = require("express");
const Folder = require("../models/folder");

const router = express.Router();

router.get("/", (req, res, next) => {
  let searchTerm = req.query.searchTerm;
  if (searchTerm) {
    return Folder.find({ name: { $regex: searchTerm, $options: "i" } })
      .sort("name")
      .then(results => {
        res.json(results);
      })
      .catch(err => {
        console.error(`ERROR: ${err.message}`);
        console.error(err);
      });
  }
  if (!searchTerm) {
    return Folder.find()
      .sort("name")
      .then(results => {
        res.json(results);
      })
      .catch(err => {
        console.error(`ERROR: ${err.message}`);
        console.error(err);
      });
  }
});

router.get("/:id", (req, res, next) => {
  let id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    next(err);
  }
  let filter = {};
  if (id) {
    filter.id = { _id: id };
  }
  return Folder.findById(filter.id, (err, user) => {
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

router.post("/", (req, res, next) => {
  const newObj = {
    name: req.body.name
  };
  if (!newObj.name) {
    console.log("Must input Name");
  }
  return Folder.create(newObj)
    .then(results => {
      res.location(`${req.originalUrl}/${results.id}`);
      res.status(201).json(results);
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error(err);
    });
});

router.put("/:id", (req, res, next) => {
  const id = req.params.id;
  const newObj = {
    name: req.body.name
  };
  return Folder.findByIdAndUpdate(id, newObj, { new: true })
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error(err);
    });
});

router.delete("/:id", (req, res, next) => {
  const id = req.params.id;
  return Folder.findByIdAndRemove(id)
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error(err);
    });
});

module.exports = router;
