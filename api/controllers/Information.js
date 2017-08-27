'use strict';

var Promise = require("bluebird");

// DB: bookshelf
var db = require('../../db');
var cached = require('../../static');

// main index
var db_regions = db('AMMNT_FIR');

var User = require('../../model/User');
var Org = require('../../model/Org');
var Permission = require('../../model/Permission');
var helper = require('../../util/express_helper');

module.exports.getUserInfo = function (req, res, next) {
  var id = 0; //req.swagger.params.id.value;

  var user = new User();
  var p = user.load(undefined, id)
  .then(function(result) {
    var perm = new Permission();
    return Promise.all([result, perm.load(undefined, id), user.loadu2o(undefined, id)]);
  })
  .then(function(data) {
    var result = data[0];
    result.permissions = data[1].permissions;
    result.organizations = data[2];
    result.id = id;
    delete(result.userId);
    delete(result.deleted);
    return(result);
  });
  helper.handle(p, req, res, next);
};

module.exports.getRegions = function(req, res, next) {
  var p = db_regions.select().then(function(result) {
    var items = result.map(function(v) {
      return { kind: "Region", id: v.IcaoCode, name: v.Name, internal_id: v.PK};
    });
    var result = {kind: "RegionList", items: items};
    return(result);
  });
  helper.handle(p, req, res, next);
};
