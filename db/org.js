
// DB: bookshelf
var db = require('../db');

module.exports = function(id){
  switch(id) {
    case 0: return db('O1T');
    case 1: return db('O1A1');
    case 2: return db('O1A2');
    case 3: return db('O1A3');
    case 4: return db('O1A4');
    case 5: return db('O1A5');
    case 6: return db('O1A6');
    case 7: return db('O1A7');
  }
};
