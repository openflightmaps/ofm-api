'use strict';

module.exports.createChangeset = function createChangeset (req, res, next) {
  var result = {};

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(result[0] || {}, null, 2));
};
