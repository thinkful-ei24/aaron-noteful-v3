const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');

// mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
//   .then(() => {
//     const searchTerm = 'lady gaga';
//     let filter = {};

//     if (searchTerm) {
//       filter.title = { $regex: searchTerm, $options: 'i' };
//     }

//     return Note.find(filter).sort({ updatedAt: 'desc' });
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect()
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });


// mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
//   .then(() => {
//     const id = '000000000000000000000002';
//     let filter = {};

//     if (id) {
//       filter.id = { _id: id };
//     }

//     return Note.findById(filter.id, (err, user) => {
//         if(err) {
//             console.log('no id');
//         }
//         else {
//             return user;
//         }
//     });
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect()
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });




// mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
//   .then(() => {

//     const newObj = {
//         title: 'New Note',
//         content: 'Some Content'
//     }

//     if (!newObj.title || !newObj.content) {
//       console.log('Must input Title and Content');
//     }

//     return Note.create(newObj);
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect()
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

  
mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
.then(() => {

  const newObj = {
      title: 'New Note',
      content: 'Some Content'
  }

  if (!newObj.title && !newObj.content) {
    console.log('Must input Title and Content');
  }

  return Note.findByIdAndUpdate(newObj);
})
.then(results => {
  console.log(results);
})
.then(() => {
  return mongoose.disconnect()
})
.catch(err => {
  console.error(`ERROR: ${err.message}`);
  console.error(err);
});