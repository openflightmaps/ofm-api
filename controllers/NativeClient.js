'use strict';

var Promise = require("bluebird");

// DB: bookshelf
var db = require('../db');
var cached = require('../static');

// main index
var  o1t = db.Model.extend({ tableName: 'O1T'  });
var o1a1 = db.Model.extend({ tableName: 'O1A1' });
var o1a2 = db.Model.extend({ tableName: 'O1A2' });
var o1a3 = db.Model.extend({ tableName: 'O1A3' });
var o1a4 = db.Model.extend({ tableName: 'O1A4' });
var o1a5 = db.Model.extend({ tableName: 'O1A5' });
var o1a6 = db.Model.extend({ tableName: 'O1A6' });
var o1a7 = db.Model.extend({ tableName: 'O1A7' });

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

// main index
var  u1t = db.Model.extend({ tableName: 'U1T'  }); // User list
var  u2t = db.Model.extend({ tableName: 'U2T'  }); // UserProperty type definition
var  u3t = db.Model.extend({ tableName: 'U3T'  }); // UserCategory definition
var u2a1 = db.Model.extend({ tableName: 'U2A1' });
var u2a2 = db.Model.extend({ tableName: 'U2A2' });
var u2a3 = db.Model.extend({ tableName: 'U2A3' });
var u2a4 = db.Model.extend({ tableName: 'U2A4' });
var u2a5 = db.Model.extend({ tableName: 'U2A5' });
var u2a6 = db.Model.extend({ tableName: 'U2A6' });
var u2a7 = db.Model.extend({ tableName: 'U2A7' });

var o1 = {
  0: u1t,  // Master
  1: u2a1, // null?
  2: u2a2, // int
  3: u2a3, // text
  4: u2a4, // string
  5: u2a5, // datetime
  6: u2a6, // blob
  7: u2a7, // bool
};
module.exports.getOrgNode = function (req, res, next) {
  console.log("getOrgNode");
  var id = req.swagger.params.id.value;
  o1t.where('OrganizationID', req.swagger.params.id.value).fetch().then(function(result) {
    console.log(result);
    if (!result) {
      res.statusCode = 404;
      return res.end();
    }
    var attributes = result.attributes;

    var o1 = o1a1.where('OrganizationID', req.swagger.params.id.value).fetchAll();
    var o2 = o1a2.where('OrganizationID', req.swagger.params.id.value).fetchAll();
    var o3 = o1a3.where('OrganizationID', req.swagger.params.id.value).fetchAll();
    var o4 = o1a4.where('OrganizationID', req.swagger.params.id.value).fetchAll();
    var o5 = o1a5.where('OrganizationID', req.swagger.params.id.value).fetchAll();
    var o6 = o1a6.where('OrganizationID', req.swagger.params.id.value).fetchAll();
    var o7 = o1a7.where('OrganizationID', req.swagger.params.id.value).fetchAll();

    Promise.join(o1, o2, o3, o4, o5, o6, o7, function(o1, o2, o3, o4, o5, o6, o7) {
      var result = [];
      result = result.concat(o1.toJSON(), o2.toJSON(), o3.toJSON(), o4.toJSON(), o5.toJSON(), o6.toJSON(), o7.toJSON());
      console.log(result);
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
  console.log("searchOrgNode");

  o1t.fetchAll().then(function(result) {
    var orgs = {};
    var result = result.toJSON().map(function(v) { orgs[v.OrganizationID] = v.OrganizationName });

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(orgs || {}, null, 2));
  });
};

module.exports.getUserNode = function (req, res, next) {
  console.log("getUserNode");
  var id = req.swagger.params.id.value;
  u1t.where('UserID', req.swagger.params.id.value).fetch().then(function(result) {
    console.log(result);
    if (!result) {
      res.statusCode = 404;
      return res.end();
    }
    var attributes = result.attributes;

    var _u2t = u2t.fetchAll(); // TODO cache, but as its not called often, don't care
    var _u3t = u3t.fetchAll();
    var u1 = u2a1.where('UserID', req.swagger.params.id.value).fetchAll();
    var u2 = u2a2.where('UserID', req.swagger.params.id.value).fetchAll();
    var u3 = u2a3.where('UserID', req.swagger.params.id.value).fetchAll();
    var u4 = u2a4.where('UserID', req.swagger.params.id.value).fetchAll();
    var u5 = u2a5.where('UserID', req.swagger.params.id.value).fetchAll();
    var u6 = u2a6.where('UserID', req.swagger.params.id.value).fetchAll();
    var u7 = u2a7.where('UserID', req.swagger.params.id.value).fetchAll();

    Promise.join(_u2t, _u2t, u1, u2, u3, u4, u5, u6, u7, function(_u2t, _u3t, u1, u2, u3, u4, u5, u6, u7) {
      var pts = {};
      _u2t.toJSON().map(function(v) { pts[v.UserPropertiesTypeID] = {description: v.UserPropertiesTypeDescription, format: v.UserPropertiesTypeFormat, multiuse: v.multipleUse}});
      
      var result = [];
      result = result.concat(u1.toJSON(), u2.toJSON(), u3.toJSON(), u4.toJSON(), u5.toJSON(), u6.toJSON(), u7.toJSON());
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
    });
  });
};

module.exports.searchUserNode = function (req, res, next) {
  console.log("searchUserNode");

  u1t.fetchAll().then(function(result) {
    var users = {};
console.log(result.toJSON());
    var result = result.toJSON().map(function(v) { users[v.UserID] = {uid: v.UserID, username:  v.Username, language: v.MainlanguagePref }});

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(users || {}, null, 2));
  });
};

module.exports.getPermissionNode = function (req, res, next) {
  console.log("getPermissionNode");
  var id = req.swagger.params.id.value;
  u1t.where('PermissionID', req.swagger.params.id.value).fetch().then(function(result) {
    console.log(result);
    if (!result) {
      res.statusCode = 404;
      return res.end();
    }
    var attributes = result.attributes;

    var _u2t = u2t.fetchAll(); // TODO cache, but as its not called often, don't care
    var _u3t = u3t.fetchAll();
    var u1 = u2a1.where('PermissionID', req.swagger.params.id.value).fetchAll();
    var u2 = u2a2.where('PermissionID', req.swagger.params.id.value).fetchAll();
    var u3 = u2a3.where('PermissionID', req.swagger.params.id.value).fetchAll();
    var u4 = u2a4.where('PermissionID', req.swagger.params.id.value).fetchAll();
    var u5 = u2a5.where('PermissionID', req.swagger.params.id.value).fetchAll();
    var u6 = u2a6.where('PermissionID', req.swagger.params.id.value).fetchAll();
    var u7 = u2a7.where('PermissionID', req.swagger.params.id.value).fetchAll();

    Promise.join(_u2t, _u2t, u1, u2, u3, u4, u5, u6, u7, function(_u2t, _u3t, u1, u2, u3, u4, u5, u6, u7) {
      var pts = {};
      _u2t.toJSON().map(function(v) { pts[v.PermissionPropertiesTypeID] = {description: v.PermissionPropertiesTypeDescription, format: v.PermissionPropertiesTypeFormat, multiuse: v.multipleUse}});
      
      var result = [];
      result = result.concat(u1.toJSON(), u2.toJSON(), u3.toJSON(), u4.toJSON(), u5.toJSON(), u6.toJSON(), u7.toJSON());
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
  console.log("searchPermissionNode");

  u1t.fetchAll().then(function(result) {
    var users = {};
console.log(result.toJSON());
    var result = result.toJSON().map(function(v) { users[v.PermissionID] = {uid: v.PermissionID, username:  v.Permissionname, language: v.MainlanguagePref }});

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(users || {}, null, 2));
  });
};
