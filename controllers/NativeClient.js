'use strict';

var Promise = require("bluebird");

// DB: bookshelf
var db = require('../db');
var static_data = require('../static');
var helper = require('../util/express_helper');
var db_user = require('../db/user');
var db_org = require('../db/org');
var User = require('../model/User');
var Org = require('../model/Org');
var Permission = require('../model/Permission');

var NativeClient = {};

NativeClient.getUserNode = function (req, res, next) {
  var id = req.swagger.params.id.value;

  var user = new User();
  var p = user.load(undefined, id);
  helper.handle(p, req, res, next);
};

NativeClient.getUserPermissionNode = function (req, res, next) {
  var id = req.swagger.params.id.value;

  var perm = new Permission();
  var p = perm.load(undefined, id);
  helper.handle(p, req, res, next);
};

NativeClient.getOrgNode = function (req, res, next) {
  var id = req.swagger.params.id.value;

  var org = new Org();
  var p = org.load(undefined, id)
  helper.handle(p, req, res, next);
};

NativeClient.searchOrgNode = function (req, res, next) {
  var org = new Org();
  var p = org.searchNode('orgs', {}, true, undefined, false)
  .then(function(data) {
    var result = {kind: "NodeNumberList", nodelist: data};
    return result;
  });
  helper.handle(p, req, res, next);
};

NativeClient.searchUserNode = function (req, res, next) {
  var user = new User();
  var p = user.searchNode('users', {}, true, undefined, false)
  .then(function(data) {
    var result = {kind: "NodeNumberList", nodelist: data};
    return result;
  });
  helper.handle(p, req, res, next);
};

NativeClient.searchPermissionNode = function (req, res, next) {
  var p = db_user('u1t').select().then(function(result) {
    var users = {};
    var result = result.map(function(v) { return({uid: v.PermissionID, username:  v.PermissionName })});

    return({items: result});
  });
  helper.handle(p, req, res, next);
};

module.exports = NativeClient;
