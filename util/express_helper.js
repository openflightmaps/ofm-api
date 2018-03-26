'use strict';

var Helper = function() {};

Helper.prototype.sendResponse = function(result, req, res, next) {
  console.log(JSON.stringify(result || {}, null, 2));
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(result || {}, null, 2));
};

Helper.prototype.sendError = function(error, req, res, next) {
  res.statusCode = 500;
  if (error && error.code == "notfound") {
    res.statusCode = 404;
  }
  res.setHeader('Content-Type', 'application/json');
//  console.log(error);
  res.end(JSON.stringify({error: error || {}}, null, 2));
};

Helper.prototype.handle = function(promise, req, res, next) {
  promise
  .then(function(result) {
    Helper.prototype.sendResponse(result, req, res, next);
  })
  .catch(function(error) {
    Helper.prototype.sendError(error, req, res, next);
  });
};

module.exports = new Helper();
