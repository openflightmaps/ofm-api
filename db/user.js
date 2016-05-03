// DB: bookshelf
var db = require('../db');

// main index
var  u1t = db('U1T'); // User list
var  u2t = db('U2T'); // UserProperty type definition
var  u3t = db('U3T'); // UserCategory definition
var u2a1 = db('U2A1');
var u2a2 = db('U2A2');
var u2a3 = db('U2A3');
var u2a4 = db('U2A4');
var u2a5 = db('U2A5');
var u2a6 = db('U2A6');
var u2a7 = db('U2A7');

module.exports = {
  u1t: u1t,// User list
  u2t: u2t,// UserProperty type definition
  u3t: u3t,// UserCategory definition
  0: u1t,  // User list
  1: u2a1, // null?
  2: u2a2, // int
  3: u2a3, // text
  4: u2a4, // string
  5: u2a5, // datetime
  6: u2a6, // blob
  7: u2a7, // bool
};
