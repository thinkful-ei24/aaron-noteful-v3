const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');
const Note = require('../models/note');
const Folder = require('../models/folder');
const Tag = require('../models/tags');

const { notes } = require('../db/seed/notes');
const folders = require('../db/seed/folders.json');
const tags = require('../db/seed/tags.json');

mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => {
    return Promise.all([
      Note.insertMany(notes),
      Folder.insertMany(folders),
      Tag.insertMany(tags),
      Folder.createIndexes(),
      Tag.createIndexes()
    ]);
  })
  .then(results => {
    console.info(`Completed ${results.length} Promises, inserting ${results.length / 5} items`);
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.error(err);
  });