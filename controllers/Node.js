'use strict';

var Promise = require("bluebird");

// DB: knex
var db = require('../db');
var static_data = require('../static');
var db_node = require('../db/node');

var app_url = process.env.APP_URL || 'http://localhost:8080';

var CONST_XML = 27;
var CONST_BLOB = 2;
var CONST_FIR_ID = 0;
var CONST_OAD_DB = 3; // Public workspace

module.exports.getNode = function (req, res, next) {
  var id = req.swagger.params.id.value;
  var db = req.swagger.params.db.value;
  var db_id = static_data.dbs[db].id;
  db_node(0).where('ServiceEntityID', id).where('ParentServiceID', db_id ).select().then(function(result) {
  if (!result || result.length == 0) {
      res.statusCode = 404;
      return res.end();
    }
	console.log(result);
    var attributes = result;

    var p = [];
    for (var i = 1; i<8; i++) {
      var columns = ["PK", "ServiceEntityPropertiesTypeID"];
      if (i != 6)
        columns.push("ServiceEntityPropertiesTypeValue");
      p.push(db_node(i).where('ServiceEntityID', req.swagger.params.id.value).select(columns));
    }      

    Promise.all(p).then(function(r) {
      var result = [].concat.apply([], r.map(function(x) {return x}));
      var merged = {};
      var value = undefined;
      var et = static_data.entity_types.value();
      var result = result.map(function(v) {
        var t = v.ServiceEntityPropertiesTypeID;
	var field;
        var val =  v.ServiceEntityPropertiesTypeValue;

	var x = {};
	var wl = static_data.whitelist_entity_types[t];

    if (et[t].type_format == 6)
        val = app_url + "/api/blobstore/" + v.PK;

	if (t == CONST_XML) {
		value = v.ServiceEntityPropertiesTypeValue;
	} else if (t == CONST_FIR_ID) {
		field = wl.name;
		val = static_data.regions.value().by_id[t].id;
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
  db_node(0).where('ServiceEntityID', req.swagger.params.id.value).where('ParentServiceID', CONST_OAD_DB ).fetch().then(function(result) {
    if (!result) {
      res.statusCode = 404;
      return res.end();
    }

    db_node(3).where('ServiceEntityID', req.swagger.params.id.value).where('ServiceEntityPropertiesTypeId', CONST_XML).fetch().then(function(result) {
      if (!result) {
        return next("nodatafound");
      }

      res.setHeader('Content-Type', 'application/xml');
      res.end(result.attributes.ServiceEntityPropertiesTypeValue);
    });
  });
};

module.exports.searchNode = function getNode (req, res, next) {
  var db = req.swagger.params.db.value;
  var db_id = static_data.dbs[db].id;

  var query = req.swagger.params.query.value;
  var deleted = req.swagger.params.deleted.value;

  var q = db_node(0);
  var mt = 'S4';

  for (var qw in query) {
    console.log(qw);
    //q.where(function() {
	  console.log("query add: " + qw);
	  var ft = 'S3A3';
	  
	  var qf = 0;
	  var qv = query[qw];
	  q.join(ft, ft + '.ServiceEntityID', '=', mt + '.ServiceEntityID').as('q1');//.where(ft + '.ServiceEntityPropertiesTypeID', qf).where(ft + '.ServiceEntityPropertiesTypeValue', qv);
    //});
  };
  console.log(q);
/*
  q = q.where('ParentServiceID', db_id );

  if (!deleted) {
    q = q.where(function() {
		this.where('deleted', false).orWhereNull('deleted');
	});
  };
*/
  q.select(mt + ".ServiceEntityID").then(function(result) {
    var result = result.map(function(v) { return v.ServiceEntityID });

    if (!result) {
      return next("notfound");
    };
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result || {}, null, 2));
  });
};