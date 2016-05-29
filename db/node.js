'use strict';

// DB: bookshelf
var db = require('../db');

module.exports = function(id){
  switch(id) {
    case 0: return db('S4');
    case 1: return db('S3A1'); // null?
    case 2: return db('S3A2'); // int
    case 3: return db('S3A3'); // text
    case 4: return db('S3A4'); // string
    case 5: return db('S3A5'); // datetime
    case 6: return db('S3A6'); // blob
    case 7: return db('S3A7'); // bool
  };
};
