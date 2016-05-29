'use strict';

// DB: bookshelf
var db = require('../db');

module.exports = function(id){
  switch(id) {
    case 0: return db('P1A');
  }
};
