'use strict';

var Promise = require("bluebird");

// DB: bookshelf
var db = require('../db');
var cached = require('../static');
var db_node = require('../db/node');

var app_url = process.env.APP_URL || 'http://localhost:8080';

var CONST_XML = 27;
var CONST_BLOB = 2;
var CONST_FIR_ID = 0;
var CONST_OAD_DB = 3; // Public workspace

module.exports.getNode = function (req, res, next) {
  var id = req.swagger.params.id.value;
  //db_node[0].where('ServiceEntityID', id).where('ParentServiceID', CONST_OAD_DB ).fetch().then(function(result) {
  db_node[0].where('ServiceEntityID', id).fetch().then(function(result) {
    if (!result) {
      res.statusCode = 404;
      return res.end();
    }
    var attributes = result.attributes;

    var p = [];
    for (var i = 1; i<8; i++) {
      var columns = ["PK", "ServiceEntityPropertiesTypeID"];
      if (i != 6)
        columns.push("ServiceEntityPropertiesTypeValue");
      p.push(db_node[i].where('ServiceEntityID', req.swagger.params.id.value).fetchAll({columns: columns}));
    }      

    Promise.all(p).then(function(r) {
      var result = [].concat.apply([], r.map(function(x) {return x.toJSON()}));
      var merged = {};
      var value = undefined;
      var et = cached.entity_types.value();
      var result = result.map(function(v) {
        var t = v.ServiceEntityPropertiesTypeID;
	var field;
        var val =  v.ServiceEntityPropertiesTypeValue;

	var x = {};
	var wl = cached.whitelist_entity_types[t];

        if (et[t].type_format == 6)
          val = app_url + "/api/blobstore/" + v.PK;

	if (t == CONST_XML) {
		value = v.ServiceEntityPropertiesTypeValue;
	} else if (t == CONST_FIR_ID) {
		field = wl.name;
		val = cached.regions.value().by_id[t].id;
	} else if (wl && wl.name) {
		field = wl.name;
	} else if (wl) {
		field = "XXX_REMOVED_" + et[t].description;
	}

	if (field) {
		if (merged[field] != undefined)
		  merged[field] = "TODO: DUPLICATES"; // list of object  types with duplicate values needed
		else
		  merged[field] = val;
	};

	return x;
      });
      var result = {tags: merged, node_id: id, revision: attributes.Revision, deleted: attributes.deleted == 1 ? true : false, timestamp:  attributes.dateOfCreation, user_id: attributes.UserID > 0 ? attributes.UserID : null, value: value};
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(result || {}, null, 2));
    });
  });
};

module.exports.putNode = function putNode (req, res, next) {
  var id = req.swagger.params.id.value;
  var body = req.swagger.body;
  db_node[0].where('ServiceEntityID', req.swagger.params.id.value).where('ParentServiceID', CONST_OAD_DB ).fetch().then(function(result) {
    if (!result) {
      res.statusCode = 404;
      return res.end();
    }

    db_node[3].where('ServiceEntityID', req.swagger.params.id.value).where('ServiceEntityPropertiesTypeId', CONST_XML).fetch().then(function(result) {
      if (!result) {
        return next("nodatafound");
      }

      res.setHeader('Content-Type', 'application/xml');
      res.end(result.attributes.ServiceEntityPropertiesTypeValue);
    });
  });
};
module.exports.searchNode = function getNode (req, res, next) {
  var deleted = req.swagger.params.deleted.value;
  var region = cached.regions.value().by_name[req.swagger.params.region.value];
  if (!region) {
    return next("invalid region");
  }
  var region_id = region.region_id;
  var q = db_node[0].where('ammnt_FirId', region_id);
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
