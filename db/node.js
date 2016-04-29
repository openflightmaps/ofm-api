// DB: bookshelf
var db = require('../db');

// main index
var s4 = db.Model.extend({
  tableName: 'S4',
});

var s3a1 = db.Model.extend({
  tableName: 'S3A1',
});

var s3a2 = db.Model.extend({
  tableName: 'S3A2'
});

var s3a3 = db.Model.extend({
  tableName: 'S3A3'
});

var s3a4 = db.Model.extend({
  tableName: 'S3A4'
});

var s3a5 = db.Model.extend({
  tableName: 'S3A5'
});

var s3a6 = db.Model.extend({
  tableName: 'S3A6'
});

var s3a7 = db.Model.extend({
  tableName: 'S3A7'
});

module.exports = {
  0: s4,
  1: s3a1, // null?
  2: s3a2, // int
  3: s3a3, // text
  4: s3a4, // string
  5: s3a5, // datetime
  6: s3a6, // blob
  7: s3a7, // bool
};
