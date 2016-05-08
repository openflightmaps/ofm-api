'use strict';

var Promise = require("bluebird");
var model_node = require('../model/Node');
var app_url = process.env.APP_URL || 'http://localhost:8080';

module.exports.getNodes = function (req, res, next) {
  var nodes = req.swagger.params.nodes.value.split(',');
  var db = req.swagger.params.db.value;

  model_node.getNodes(db, nodes)
  .then(function(result) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result || {}, null, 2));
  })
  .catch(function(error) {
    res.statusCode = 500;
    return res.end(error.message);
  });
};

module.exports.getNode = function (req, res, next) {
  var id = req.swagger.params.id.value;
  var db = req.swagger.params.db.value;

  model_node.getNode(db, id)
  .then(function(result) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result || {}, null, 2));
  })
  .catch(function(error) {
    res.statusCode = 500;
    return res.end(error.message);
  });
};

module.exports.searchNode = function getNode (req, res, next) {
  var db = req.swagger.params.db.value;
  var query = req.swagger.params.query.value;
  var deleted = req.swagger.params.deleted.value;

  var bbox;

  model_node.searchNode(db, query, deleted, bbox)
  .then(function(result) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result || {}, null, 2));
  })
  .catch(function(error) {
    res.statusCode = 500;
    return res.end(error.message);
  });
};
