'use strict';

var Promise = require("bluebird");

// DB: bookshelf
var db = require('../db');
var cached = require('../static');
var db_user = require('../db/user');

// main index
var  o1t = db('O1T');
var o1a1 = db('O1A1');
var o1a2 = db('O1A2');
var o1a3 = db('O1A3');
var o1a4 = db('O1A4');
var o1a5 = db('O1A5');
var o1a6 = db('O1A6');
var o1a7 = db('O1A7');

var o1 = {
  0: o1t,  // Master
  1: o1a1, // null?
  2: o1a2, // int
  3: o1a3, // text
  4: o1a4, // string
  5: o1a5, // datetime
  6: o1a6, // blob
  7: o1a7, // bool
};

module.exports.getOrgNode = function (req, res, next) {
  var id = req.swagger.params.id.value;
  o1t.where('OrganizationID', req.swagger.params.id.value).select().then(function(result) {
    if (!result) {
      res.statusCode = 404;
      return res.end();
    }
    var attributes = result.attributes;

    var o1 = o1a1.where('OrganizationID', req.swagger.params.id.value).select();
    var o2 = o1a2.where('OrganizationID', req.swagger.params.id.value).select();
    var o3 = o1a3.where('OrganizationID', req.swagger.params.id.value).select();
    var o4 = o1a4.where('OrganizationID', req.swagger.params.id.value).select();
    var o5 = o1a5.where('OrganizationID', req.swagger.params.id.value).select();
    var o6 = o1a6.where('OrganizationID', req.swagger.params.id.value).select();
    var o7 = o1a7.where('OrganizationID', req.swagger.params.id.value).select();

    Promise.join(o1, o2, o3, o4, o5, o6, o7, function(o1, o2, o3, o4, o5, o6, o7) {
      var result = [];
      result = result.concat(o1, o2, o3, o4, o5, o6, o7);
      var merged = {};
      var value = undefined;
      var result = result.map(function(v) {
        var val =  v.UserPropertiesTypeValue;
        if (val instanceof Buffer)
	  val = v.UserPropertiesTypeValue.toString('base64');
        else
	  val = v.UserPropertiesTypeValue;

        if (merged[v.UserPropertiesTypeID] != undefined)
	  merged[v.UserPropertiesTypeID] = "TODO: DUPLICATES"; // list of object  types with duplicate values needed
        else
	  merged[v.UserPropertiesTypeID] = val;
      });
      var result = {tags: merged, attributes: attributes};
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(result || {}, null, 2));
    });
  });
};

module.exports.searchOrgNode = function (req, res, next) {
  o1t.select().then(function(result) {
    var orgs = {};
    var result = result.map(function(v) { orgs[v.OrganizationID] = v.OrganizationName });

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(orgs || {}, null, 2));
  });
};

module.exports.getUserNode = function (req, res, next) {
  var id = req.swagger.params.id.value;
  db_user.u1t.where('UserID', req.swagger.params.id.value).select().then(function(result) {
    if (!result) {
      res.statusCode = 404;
      return res.end();
    }
    var attributes = result.attributes;

    var _u2t = db_user.u2t.select(); // TODO cache, but as its not called often, don't care
    var _u3t = db_user.u3t.select();

    var p = [];
    for (var i = 1; i<8; i++) {
      p.push(db_user[i].where('UserID', req.swagger.params.id.value).select());
    }

    var pts = {};
    Promise.join(_u2t, _u2t, function(_u2t, _u3t) {
      _u2t.map(function(v) { pts[v.UserPropertiesTypeID] = {description: v.UserPropertiesTypeDescription, format: v.UserPropertiesTypeFormat, multiuse: v.multipleUse}});
    }).then(function(){Promise.all(p).then(function(r) {
      var result = [].concat.apply([], r.map(function(x) {return x}));
      var merged = {};
      var value = undefined;
      var result = result.map(function(v) {
        var field;
        var val =  v.UserPropertiesTypeValue;
        if (val instanceof Buffer)
	  val = v.UserPropertiesTypeValue.toString('base64');
        else
	  val = v.UserPropertiesTypeValue;

        var pt = pts[v.UserPropertiesTypeID];

        if (pt && pt.name)
          field = pt.name
        else if (pt)
          field = "XXX_SHORTNAME_NEEDED_" + pt.description;

        if (pt != undefined && pt.multiuse == 1) {
          if (merged[field] != undefined)
            merged[field].push(val);
          else 
	    merged[field] = [val];
        } else {
          if (merged[field] != undefined)
            merged[field] = "MULTIUSE NOT ALLOWED!"; // ABORT!!!
          else
	    merged[field] = val;
        }
      });
      var result = {tags: merged, uid: attributes.UserID, username: attributes.Username, language: attributes.MainlanguagePref};
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(result || {}, null, 2));
    })});
  });
};

module.exports.searchUserNode = function (req, res, next) {
  db_user.u1t.select().then(function(result) {
    var users = {};
    var result = result.map(function(v) { users[v.UserID] = {uid: v.UserID, username:  v.Username, language: v.MainlanguagePref }});

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(users || {}, null, 2));
  });
};

module.exports.getPermissionNode = function (req, res, next) {
  var id = req.swagger.params.id.value;
  db_user.u1t.where('PermissionID', req.swagger.params.id.value).select().then(function(result) {
    if (!result) {
      res.statusCode = 404;
      return res.end();
    }
    var attributes = result.attributes;

    var _u2t = db_user.u2t.select(); // TODO cache, but as its not called often, don't care
    var _u3t = db_user.u3t.select();
    var u1 = u2a1.where('PermissionID', req.swagger.params.id.value).select();
    var u2 = u2a2.where('PermissionID', req.swagger.params.id.value).select();
    var u3 = u2a3.where('PermissionID', req.swagger.params.id.value).select();
    var u4 = u2a4.where('PermissionID', req.swagger.params.id.value).select();
    var u5 = u2a5.where('PermissionID', req.swagger.params.id.value).select();
    var u6 = u2a6.where('PermissionID', req.swagger.params.id.value).select();
    var u7 = u2a7.where('PermissionID', req.swagger.params.id.value).select();

    Promise.join(_u2t, _u2t, u1, u2, u3, u4, u5, u6, u7, function(_u2t, _u3t, u1, u2, u3, u4, u5, u6, u7) {
      var pts = {};
      _u2t.map(function(v) { pts[v.PermissionPropertiesTypeID] = {description: v.PermissionPropertiesTypeDescription, format: v.PermissionPropertiesTypeFormat, multiuse: v.multipleUse}});
      
      var result = [];
      result = result.concat(u1, u2, u3, u4, u5, u6, u7);
      var merged = {};
      var value = undefined;
      var result = result.map(function(v) {
        var field;
        var val =  v.PermissionPropertiesTypeValue;
        if (val instanceof Buffer)
	  val = v.PermissionPropertiesTypeValue.toString('base64');
        else
	  val = v.PermissionPropertiesTypeValue;

        var pt = pts[v.PermissionPropertiesTypeID];

        if (pt && pt.name)
          field = pt.name
        else if (pt)
          field = "XXX_SHORTNAME_NEEDED_" + pt.description;

        if (pt != undefined && pt.multiuse == 1) {
          if (merged[field] != undefined)
            merged[field].push(val);
          else 
	    merged[field] = [val];
        } else {
          if (merged[field] != undefined)
            merged[field] = "MULTIUSE NOT ALLOWED!"; // ABORT!!!
          else
	    merged[field] = val;
        }
      });
      var result = {tags: merged, uid: attributes.PermissionID, username: attributes.Permissionname, language: attributes.MainlanguagePref};
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(result || {}, null, 2));
    });
  });
};

module.exports.searchPermissionNode = function (req, res, next) {
  db_user.u1t.select().then(function(result) {
    var users = {};
    var result = result.map(function(v) { users[v.PermissionID] = {uid: v.PermissionID, username:  v.Permissionname, language: v.MainlanguagePref }});

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(users || {}, null, 2));
  });
};
