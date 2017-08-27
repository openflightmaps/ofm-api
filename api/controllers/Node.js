'use strict';

var Node = require('../../model/Node');
var helper = require('../../util/express_helper');

module.exports.getMultipleNodes = function (req, res, next) {
  var nodes = req.swagger.params.nodes.value.split(',');
  var db = req.swagger.params.db.value;

  var node = new Node();
  var p = node.getNodes(db, nodes)
  .then(function(result) {
    return({kind: "NodeList", items: result});
  });
  helper.handle(p, req, res, next);
};

module.exports.updateNode = function (req, res, next) {
  var id = req.swagger.params.id.value;
  var db = req.swagger.params.db.value;
  var value = req.swagger.params.body.value;

  var node = new Node();
  var p = node.load(db, id)
  .then(function() {
    return node.updateNode(db, id, value, false)
   })
  helper.handle(p, req, res, next);
};

module.exports.getNode = function (req, res, next) {
  var id = req.swagger.params.id.value;
  var db = req.swagger.params.db.value;

  var node = new Node();
  var p = node.load(db, id)
  helper.handle(p, req, res, next);
};

module.exports.deleteNode = function (req, res, next) {
  var id = req.swagger.params.id.value;
  var db = req.swagger.params.db.value;

  var node = new Node();
  var p = node.deleteNode(db, id)
  helper.handle(p, req, res, next);
};

module.exports.searchNode = function (req, res, next) {
  var db = req.swagger.params.db.value;
  var query = req.swagger.params.query.value;
  var deleted = req.swagger.params.deleted.value;

  var bbox;

  var node = new Node();
  var p = node.searchNode(db, query, deleted, bbox)
  .then(function(data) {
    var result = {kind: "NodeNumberList", nodelist: data};
    return result;
  })
  helper.handle(p, req, res, next);
};
