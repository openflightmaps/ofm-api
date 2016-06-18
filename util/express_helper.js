'use strict';

var Helper = function() {};

Helper.prototype.sendResponse = function(data, req, res, next) {
  console.log("KIND: "+data.kind);
  var result = {apiVersion: '0.1', id: req.id, data: data};
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(result || {}, null, 2));
};

Helper.prototype.sendError = function(error, req, res, next) {
  res.statusCode = 500;
  res.setHeader('Content-Type', 'application/json');
  console.log(error);
  res.end(JSON.stringify({apiVersion: '0.1', id: req.id, error: error || {}}, null, 2));
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
