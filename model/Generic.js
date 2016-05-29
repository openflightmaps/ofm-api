'use strict';

var Promise = require("bluebird");
var knex = require('../db');

function Generic() {
  this.tags = {};
};

Generic.prototype.getNodes = function(db, nodes) {
  var self = this;
  var config = this.config;
  var p = [];
  for (var id in nodes) {
    var n = new self.__proto__.constructor;
    p.push(n.load(db, nodes[id]));
  };

  return new Promise(function(resolve, reject) {
    Promise.all(p).then(function(results) {
      resolve(results);
    }).catch(function(err) {
      reject(err);
    });
  });
};

Generic.prototype.updateNode = function(db, id, value, create) {
  var config = this.config;
  return new Promise(function(resolve, reject) {
    var db_id = config.dbs.value().by_name[db].id;
    knex.transaction(function(trx) {
      return config.db(0).transacting(trx).where(config.pk, id).where(config.parent, db_id ).where('Revision', value.revision).increment('Revision', 1).then(function(result) {
        if (!result || result.length == 0) {
          reject({code: "notfound", message: "revision not found"});
          return;
        }
        var attributes = result;

        var p = [];
        for (var i = 1; i<8; i++) {
          p.push(config.db(i).transacting(trx).where(config.pk, id).delete());
        }

        var et = config.types.value();
        var v = value.tags;
        var keys = Object.keys(v)
        for (var i in keys) {
          var field = keys[i];
          var val =  v[keys[i]];
          var wl = et.by_name[field];
          var t = wl.id;
          var f = wl.type_format;
          var ins = {};
          ins[config.pk] = id;
          ins[config.id] = t;
          ins[config.value] = val;
          p.push(config.db(f).transacting(trx).insert(ins));
        };
        return Promise.all(p);
      });
    }).then(function(r) {
      console.log(r); resolve();
    }).catch(function(error) {
      console.log(error);
    });
  });
};

Generic.prototype.deleteNode = function(db, id, revision) {
  var config = this.config;
  return new Promise(function(resolve, reject) {
    var db_id = config.dbs.value().by_name[db].id;
    knex.transaction(function(trx) {
      return config.db(0).transacting(trx).where(config.pk, id).where(config.parent, db_id ).update("deleted", true).then(function(result) {
        if (!result || result.length == 0) {
          reject({code: "notfound", message: "node not found"});
          return;
        } else {
          return {code: "success"};
        }
      });
    }).then(function(r) {
      console.log(r); resolve(r);
    }).catch(function(error) {
      console.log(error);
    });
  });
};

Generic.prototype.load = function(db, id) {
  var self = this;
  var config = self.config;
  return new Promise(function(resolve, reject) {
    var k = config.db(0).where(config.pk, id);
    if (config.parent) {
      var db_id = config.dbs.value().by_name[db].id;
      k.where(config.parent, db_id);
    }
    k.select().then(function(result) {
      if (!result || result.length == 0) {
        reject({code: "notfound", message: "not found"});
        return;
      }
      var attributes = result[0];

      var p = [];
      for (var i = 1; i<8; i++) {
        var columns = [config.id];
	if (i == 6 && !config.blobembed) {
          columns.push("PK");
        } else {
          columns.push(config.value);
        }
        if (config.db(i)) {
          p.push(config.db(i).where(config.pk, id).select(columns));
        }
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

          if (et.by_id[t].type_format == 6) {
            if (config.blobembed) {
              val = 'data:application/binary-data;base64:' + val.toString('base64');
            } else {
              val = config.app_url + "/api/blobstore/" + v.PK;
            }
          }

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
        self.tags = merged;
        self.node_id = id;
        self.revision = attributes.Revision;
        self.deleted = attributes.deleted == 1 ? true : false;
        self.timestamp = attributes.dateOfCreation;
        self.user_id = attributes.UserID > 0 ? attributes.UserID : null;

        var result = {tags: merged, node_id: id, revision: attributes.Revision, deleted: attributes.deleted == 1 ? true : false, timestamp:  attributes.dateOfCreation, user_id: attributes.UserID > 0 ? attributes.UserID : null, value: value};
        resolve(result);
      });
    });
  });
};

Generic.prototype.getNode = function(db, id) {
  var config = this.config;
  return new Promise(function(resolve, reject) {
    var db_id = config.dbs.value().by_name[db].id;
    config.db(0).where(config.pk, id).where(config.parent, db_id ).select().then(function(result) {
      if (!result || result.length == 0) {
        reject({code: "notfound", message: "not found"});
        return;
      }
      var attributes = result[0];

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
console.log(attributes);
        var result = {tags: merged, node_id: id, revision: attributes.Revision, deleted: attributes.deleted == 1 ? true : false, timestamp:  attributes.dateOfCreation, user_id: attributes.UserID > 0 ? attributes.UserID : null, value: value};
        resolve(result);
      });
    });
  });
};

Generic.prototype.searchNode = function(db, query, deleted, bbox) {
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

Generic.prototype.config = {
    app_url: "",
    pk: 'ServiceEntityID',
    parent: "ParentServiceID",
    id: "ServiceEntityPropertiesTypeID",
    value: "ServiceEntityPropertiesTypeValue",
    db: null,
    dbs: null,
    types: null,
  };

module.exports = Generic;
