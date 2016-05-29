'use strict';

// DB: bookshelf
var db = require('../db');

module.exports = function(id){
  switch(id) {
    case 0: return db('U1T'); // User list
    case 'u1t': return db('U1T'); // User list
    case 'u2t': return db('U2T'); // UserProperty type definition
    case 'u3t': return db('U3T'); // UserCategory definition
    case 1: return db('U2A1');
    case 2: return db('U2A2');
    case 3: return db('U2A3');
    case 4: return db('U2A4');
    case 5: return db('U2A5');
    case 6: return db('U2A6');
    case 7: return db('U2A7');
  }
};
