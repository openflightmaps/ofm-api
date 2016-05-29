'use strict';

var Promise = require("bluebird");

// DB: bookshelf
var db = require('../db');
var cached = require('../static');

// main index
var db_regions = db('AMMNT_FIR');

var User = require('../model/User');
var Org = require('../model/Org');
var Permission = require('../model/Permission');

module.exports.getUserInfo = function (req, res, next) {
  var id = 1; //req.swagger.params.id.value;

  var user = new User();
  user.load(undefined, id)
  .then(function(result) {
    var perm = new Permission();
    return Promise.all([result, perm.load(undefined, id)]);
  })
  .then(function(data) {
    var result = data[0];
    result.permissions = data[1].permissions;
    result.user_id = id;
    delete(result.node_id);
    delete(result.deleted);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result || {}, null, 2));
  })
  .catch(function(error) {
    res.statusCode = 500;
    return res.end(error.message);
  });
};

module.exports.getRegions = function(req, res, next) {
  db_regions.select().then(function(result) {
    if (!result) {
      res.statusCode = 404;
      return res.end();
    }
    var regions = {};
    result.map(function(v) {
      regions[v.IcaoCode] = {name: v.Name, id: v.PK};
    });
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(regions || {}, null, 2));
  });
};
