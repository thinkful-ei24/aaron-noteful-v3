'use strict';

require('dotenv').config();


module.exports = {
  PORT: process.env.PORT || 8080,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/aaron-noteful-v3',
  TEST_MONGODB_URI: process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/aaron-noteful-v3-test',
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY || '7d'
};