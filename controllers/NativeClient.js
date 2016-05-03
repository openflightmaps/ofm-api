'use strict';

var Promise = require("bluebird");

// DB: bookshelf
var db = require('../db');
var static_data = require('../static');
var db_user = require('../db/user');
var db_org = require('../db/org');


module.exports.getOrgNode = function (req, res, next) {
  var id = req.swagger.params.id.value;
  db_org(0).where('OrganizationID', req.swagger.params.id.value).select().then(function(result) {
    if (!result) {
      res.statusCode = 404;
      return res.end();
    }
    var attributes = result;

    var p = [];
    for (var i = 1; i<8; i++) {
      var columns = ["PK", "OrganizationID"];
      columns.push("UserPropertiesTypeID", "UserPropertiesTypeValue");
      p.push(db_org(i).where('OrganizationID', req.swagger.params.id.value).select(columns));
    }

    Promise.all(p).then(function(r) {
      var result = [].concat.apply([], r.map(function(x) {return x}));
      var merged = {};
      var value = undefined;
      var result = result.map(function(v) {
        var pt = static_data.up_types.value().by_id[v.UserPropertiesTypeID];
	var field;
	var x = {};
        if (pt && pt.name) {
		field = pt.name;
	} else if (pt) {
		field = "XXX_SHORTNAME_MISSING_" + pt.description;
	}
        var val =  v.UserPropertiesTypeValue;
        if (val instanceof Buffer)
	  val = val.toString('base64');

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
      var result = {tags: merged, id: attributes.OrganizationID, name: attributes.OrganizationName, attributes: attributes};
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(result || {}, null, 2));
    });
  });
};

module.exports.searchOrgNode = function (req, res, next) {
  db_org(0).select().then(function(result) {
    var orgs = {};
    var result = result.map(function(v) { orgs[v.OrganizationID] = v.OrganizationName });

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(orgs || {}, null, 2));
  });
};

module.exports.getUserNode = function (req, res, next) {
  var id = req.swagger.params.id.value;
  db_user('u1t').where('UserID', req.swagger.params.id.value).select().then(function(result) {
    if (!result) {
      res.statusCode = 404;
      return res.end();
    }
    var attributes = result;

    var _u2t = db_user('u2t').select(); // TODO cache, but as its not called often, don't care
    var _u3t = db_user('u3t').select();

    var p = [];
    for (var i = 1; i<8; i++) {
      p.push(db_user(i).where('UserID', req.swagger.params.id.value).select());
    }

    Promise.join(_u2t, _u2t, function(_u2t, _u3t) {
      var pts = {};
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

        var pt = static_data.up_types.value().by_id[v.UserPropertiesTypeID];

        if (pt && pt.name)
          field = pt.name
        else if (pt)
          field = pt.description; // "XXX_SHORTNAME_NEEDED_" + pt.description;

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
  db_user('u1t').select().then(function(result) {
    var users = {};
    var result = result.map(function(v) { users[v.UserID] = {uid: v.UserID, username:  v.Username, language: v.MainlanguagePref }});

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(users || {}, null, 2));
  });
};

module.exports.getPermissionNode = function (req, res, next) {
  var id = req.swagger.params.id.value;
  db_user('u1t').where('PermissionID', req.swagger.params.id.value).select().then(function(result) {
    if (!result) {
      res.statusCode = 404;
      return res.end();
    }
    var attributes = result.attributes;

    var _u2t = db_user('u2t').select(); // TODO cache, but as its not called often, don't care
    var _u3t = db_user('u3t').select();
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
  db_user('u1t').select().then(function(result) {
    var users = {};
    var result = result.map(function(v) { users[v.PermissionID] = {uid: v.PermissionID, username:  v.Permissionname, language: v.MainlanguagePref }});

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(users || {}, null, 2));
  });
};
