'use strict';

var Promise = require("bluebird");

// DB: knex
var db = require('../db');

function getNodes(db, nodes) {
  var config = this.config;
  var p = [];
  for (var id in nodes) {
    p.push(this.getNode(db, nodes[id]));
  };

  return new Promise(function(resolve, reject) {
    Promise.all(p).then(function(results) {
      resolve(results);
    }).catch(function(err) {
      reject(err);
    });
  });
};

function getNode(db, id) {
  var config = this.config;
  return new Promise(function(resolve, reject) {
    var db_id = config.dbs.value().by_name[db].id;
    config.db(0).where(config.pk, id).where(config.parent, db_id ).select().then(function(result) {
      if (!result || result.length == 0) {
        reject({code: "notfound", message: "not found"});
      }
      var attributes = result;

      var p = [];
      for (var i = 1; i<8; i++) {
        var columns = ["PK", config.id];
        if (i != 6)
          columns.push(config.value);
        p.push(config.db(i).where(config.pk, id).select(columns));
      }      

      Promise.all(p).then(function(r) {
        var result = [].concat.apply([], r.map(function(x) {return x}));
        var merged = {};
        var value = undefined;
        var et = config.types.value();
        var result = result.map(function(v) {
          var t = v[config.id];
  	  var field;
          var val =  v[config.value];

  	  var x = {};
  	  var wl = et.by_id[t];

          if (et.by_id[t].type_format == 6)
            val = config.app_url + "/api/blobstore/" + v.PK;

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
        resolve(result);
      });
    });
  });
};

function searchNode (db, query, deleted, bbox) {
  var config = this.config;
  return new Promise(function(resolve, reject) {
    var db_id = config.dbs.value().by_name[db].id;
    // todo bbox

    var q = config.db(0);
    var mt = config.db(0)._single.table;
    var qi = 1;

    for (var qw in query) {
      var wlt = config.types.value().by_name[qw];
      var ft = config.db(wlt.type_format)._single.table;
  
      var qf = wlt.id;
      var qv = query[qw];
      var qin = 'q' + qi++;
      q.join(ft + " as " + qin, qin + '.' + config.pk, '=', mt + '.' + config.pk).as(qin);
      q.where(qin + '.' + config.id, qf).where(qin + '.' + config.value, qv);
    };

    q = q.where(mt + '.' + config.parent, db_id );

    if (!deleted) {
      q = q.where(function() {
        this.where(mt + '.deleted', false).orWhereNull(mt + '.deleted');
      });
    };

    q.select(mt + '.' + config.pk).then(function(result) {
      var result = result.map(function(v) { return v[config.pk]});

      if (!result) {
        fail("notfound");
      };
      resolve(result);
    });
  });
};

function Generic(config) {
  this.config = config || {
    app_url: app_url,
    pk: 'ServiceEntityID',
    parent: "ParentServiceID",
    id: "ServiceEntityPropertiesTypeID",
    value: "ServiceEntityPropertiesTypeValue",
    db: require('../db/node'),
    dbs: static_data.service_dbs,
    types: static_data.entity_types,
  };
  this.getNode = getNode;
  this.getNodes = getNodes;
  this.searchNode = searchNode;
};

module.exports = function (config) {
  return new Generic(config);
};
