'use strict';

var Promise = require("bluebird");

// DB: bookshelf
var db = require('../db');
var cached = require('../static');

// main index
var s4 = db.Model.extend({
  tableName: 'S4',
});

var s3a1 = db.Model.extend({
  tableName: 'S3A1',
});

var s3a2 = db.Model.extend({
  tableName: 'S3A2'
});

var s3a3 = db.Model.extend({
  tableName: 'S3A3'
});

var s3a4 = db.Model.extend({
  tableName: 'S3A4'
});

var s3a5 = db.Model.extend({
  tableName: 'S3A5'
});

var s3a6 = db.Model.extend({
  tableName: 'S3A6'
});

var s3a7 = db.Model.extend({
  tableName: 'S3A7'
});

var s3 = {
  1: s3a1, // null?
  2: s3a2, // int
  3: s3a3, // text
  4: s3a4, // string
  5: s3a5, // datetime
  6: s3a6, // blob
  7: s3a7, // bool
};

var CONST_XML = 27;
var CONST_BLOB = 2;
var CONST_FIR_ID = 0;
var CONST_OAD_DB = 3; // Public workspace

/*
module.exports.getNode = function getNode (req, res, next) {
  console.log("getNode");
  s4.where('ServiceEntityID', req.swagger.params.id.value).where('ParentServiceID', CONST_OAD_DB ).fetch().then(function(result) {
    console.log(result);
    if (!result) {
      res.statusCode = 404;
      return res.end();
    }

    s3a3.where('ServiceEntityID', req.swagger.params.id.value).where('ServiceEntityPropertiesTypeId', CONST_XML).fetch().then(function(result) {
      console.log(result);
      if (!result) {
        return next("nodatafound");
      }

      res.setHeader('Content-Type', 'application/xml');
      res.end(result.attributes.ServiceEntityPropertiesTypeValue);
    });
  });
};
*/

module.exports.getNode = function (req, res, next) {
  console.log("getNode");
  var id = req.swagger.params.id.value;
  s4.where('ServiceEntityID', id).where('ParentServiceID', CONST_OAD_DB ).fetch().then(function(result) {
    var attributes = result.attributes;
    console.log(result);
    if (!result) {
      res.statusCode = 404;
      return res.end();
    }

    var a1 = s3a1.where('ServiceEntityID', req.swagger.params.id.value).fetchAll({columns: ["ServiceEntityPropertiesTypeID", "ServiceEntityPropertiesTypeValue"]});
    var a2 = s3a2.where('ServiceEntityID', req.swagger.params.id.value).fetchAll({columns: ["ServiceEntityPropertiesTypeID", "ServiceEntityPropertiesTypeValue"]});
    var a3 = s3a3.where('ServiceEntityID', req.swagger.params.id.value).fetchAll({columns: ["ServiceEntityPropertiesTypeID", "ServiceEntityPropertiesTypeValue"]});
    var a4 = s3a4.where('ServiceEntityID', req.swagger.params.id.value).fetchAll({columns: ["ServiceEntityPropertiesTypeID", "ServiceEntityPropertiesTypeValue"]});
    var a5 = s3a5.where('ServiceEntityID', req.swagger.params.id.value).fetchAll({columns: ["ServiceEntityPropertiesTypeID", "ServiceEntityPropertiesTypeValue"]});
    var a6 = s3a6.where('ServiceEntityID', req.swagger.params.id.value).fetchAll({columns: ["ServiceEntityPropertiesTypeID", "ServiceEntityPropertiesTypeValue"]});
    var a7 = s3a7.where('ServiceEntityID', req.swagger.params.id.value).fetchAll({columns: ["ServiceEntityPropertiesTypeID", "ServiceEntityPropertiesTypeValue"]});

    Promise.join(a1, a2, a3, a4, a5, a6, a7, function(a1, a2, a3, a4, a5, a6, a7) {
      var result = [];
      result = result.concat(a1.toJSON(), a2.toJSON(), a3.toJSON(), a4.toJSON(), a5.toJSON(), a6.toJSON(), a7.toJSON());
      console.log(result);
      var merged = {};
      var value = undefined;
      var et = cached.entity_types.value();
      var result = result.map(function(v) {
	var x = {};
	var wl = cached.whitelist_entity_types[v.ServiceEntityPropertiesTypeID];
	if (v.ServiceEntityPropertiesTypeID == CONST_XML)
		value = v.ServiceEntityPropertiesTypeValue;
	else if (v.ServiceEntityPropertiesTypeID == CONST_FIR_ID)
		merged[wl.name] = cached.regions.value().by_id[v.ServiceEntityPropertiesTypeValue]
	else if (wl && wl.name)
		merged[wl.name] = v.ServiceEntityPropertiesTypeValue
	else if (wl)
		merged["XXX_REMOVED_" + et[v.ServiceEntityPropertiesTypeID].description] = v.ServiceEntityPropertiesTypeValue;
	return x;
      });
      var result = {tags: merged, node_id: id, revision: attributes.Revision, deleted: attributes.deleted == 1 ? true : false, timestamp:  attributes.dateOfCreation, user_id: attributes.UserID > 0 ? attributes.UserID : null, value: value};
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(result || {}, null, 2));
    });
  });
};

module.exports.putNode = function putNode (req, res, next) {
  console.log("putNode");
  var id = req.swagger.params.id.value;
  var body = req.swagger.body;
  console.log (body);
  s4.where('ServiceEntityID', req.swagger.params.id.value).where('ParentServiceID', CONST_OAD_DB ).fetch().then(function(result) {
    console.log(result);
    if (!result) {
      res.statusCode = 404;
      return res.end();
    }

    s3a3.where('ServiceEntityID', req.swagger.params.id.value).where('ServiceEntityPropertiesTypeId', CONST_XML).fetch().then(function(result) {
      console.log(result);
      if (!result) {
        return next("nodatafound");
      }

      res.setHeader('Content-Type', 'application/xml');
      res.end(result.attributes.ServiceEntityPropertiesTypeValue);
    });
  });
};
module.exports.searchNode = function getNode (req, res, next) {
  console.log("searchNode");
  var deleted = req.swagger.params.deleted.value;
  var region = cached.regions.value().by_name[req.swagger.params.region.value];
console.log(req.swagger.params.region.value);
console.log(cached.regions);
  if (!region) {
    return next("invalid region");
  }
  var region_id = region.region_id;
  var q = s4.where('ammnt_FirId', region_id);
  if (!deleted)
    q = q.where('deleted', false);

  q.fetchAll({columns: ["ServiceEntityID"]}).then(function(result) {
    var result = result.toJSON().map(function(v) { return v.ServiceEntityID });

    if (!result) {
      return next("notfound");
    };
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result || {}, null, 2));
  });
};
