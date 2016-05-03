'use strict';

var Promise = require("bluebird");

// DB: knex
var db = require('../db');
var static_data = require('../static');
var db_node = require('../db/node');

var app_url = process.env.APP_URL || 'http://localhost:8080';

module.exports.getNode = function (req, res, next) {
  var id = req.swagger.params.id.value;
  var db = req.swagger.params.db.value;
  var db_id = static_data.service_dbs.value().by_name[db].id;
  db_node(0).where('ServiceEntityID', id).where('ParentServiceID', db_id ).select().then(function(result) {
  if (!result || result.length == 0) {
      res.statusCode = 404;
      return res.end();
    }
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
	var wl = et.by_id[t];

        if (et.by_id[t].type_format == 6)
            val = app_url + "/api/blobstore/" + v.PK;

	//if (t == CONST_FIR_ID) {
	//	field = wl.name;
	//	val = static_data.regions.value().by_id[t].id;
	//} else
        if (wl && wl.name) {
		field = wl.name;
	} else if (wl) {
		field = "XXX_SHORTNAME_MISSING_" + et.by_id[t].description;
	}

	if (field) {
          if (wl != undefined && wl.multiuse == 1) {
            if (merged[field] != undefined)
              merged[field].push(val);
            else 
	      merged[field] = [val];
          } else {
            if (merged[field] != undefined)
              merged[field] = "MULTIUSE NOT ALLOWED!"; // ABORT!!!
            else
	      merged[field] = val;
          };
        }
	return x;
      });
      var result = {tags: merged, node_id: id, revision: attributes.Revision, deleted: attributes.deleted == 1 ? true : false, timestamp:  attributes.dateOfCreation, user_id: attributes.UserID > 0 ? attributes.UserID : null, value: value};
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(result || {}, null, 2));
    });
  });
};

module.exports.searchNode = function getNode (req, res, next) {
  var db = req.swagger.params.db.value;
  var db_id = static_data.service_dbs.value().by_name[db].id;

  var query = req.swagger.params.query.value;
  var deleted = req.swagger.params.deleted.value;

  var q = db_node(0);
  var mt = 'S4';
  var qi = 1;

  for (var qw in query) {
    var wlt = static_data.entity_types.value().by_name[qw];
    var ft = 'S3A' + wlt.type_format;
  
    var qf = wlt.id;
    var qv = query[qw];
    var qin = 'q' + qi++;
    q.join(ft + " as " + qin, qin + '.ServiceEntityID', '=', mt + '.ServiceEntityID').as(qin);
    q.where(qin + '.ServiceEntityPropertiesTypeID', qf).where(qin + '.ServiceEntityPropertiesTypeValue', qv);
  };

  q = q.where(mt + '.ParentServiceID', db_id );

  if (!deleted) {
    q = q.where(function() {
		this.where(mt + '.deleted', false).orWhereNull(mt + '.deleted');
	});
  };

  q.select(mt + ".ServiceEntityID").then(function(result) {
    var result = result.map(function(v) { return v.ServiceEntityID });

    if (!result) {
      return next("notfound");
    };
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result || {}, null, 2));
  });
};
