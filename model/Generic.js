'use strict';

var app_url = process.env.APP_URL || 'http://localhost:8080';
var legacy_mode = process.env.LEGACY_MODE || true;

var Promise = require("bluebird");
var knex = require('../db');

function Generic() {
  this.kind = "Generic";
  this.tags = {};
  this.config = {
    app_url: app_url + '/0.1',
    legacy_mode: legacy_mode,
  };
  Object.defineProperty(this, 'config', {
    enumerable: false
  });
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
          return {id: id};
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
              val = config.app_url + "/blobstore/" + v.PK;
            }
          }

          if (wl && wl.name) {
		field = wl.name;
	  } else if (wl) {
		field = "XXX_SHORTNAME_MISSING_" + et.by_id[t].description;
	  }

          // in legacy mode, always return strings
          if (config.legacy_mode) {
            val = new String(val);
          }

          // map value using configured mapper
          if (config.tag_map && config.tag_map[field]) {
            val = config.tag_map[field].value().by_id[val].id;
          }
	  if (field) {
            if (wl != undefined && wl.multiuse == 1) {
              if (merged[field] != undefined)
                merged[field].push(val);
              else
	        merged[field] = [val];
            } else {
              if (merged[field] != undefined)
                console.log("MULTIUSE NOT ALLOWED!" + field); // ABORT!!!
              else
	        merged[field] = val;
            };
          }
	  return x;
        });
        self.tags = merged;
        self.id = id;
        self.revision = attributes.Revision;
        self.deleted = attributes.deleted == 1 ? true : false;
        self.updated = attributes.dateOfCreation;
        self.userId = attributes.UserID > 0 ? attributes.UserID : undefined;

        resolve(self);
      });
    });
  });
};

Generic.prototype.searchNode = function(db, query, deleted, bbox, embedresult) {
  var self = this;
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

    if (config.parent) {
      q = q.where(mt + '.' + config.parent, db_id );
    };

    if (!deleted) {
      q = q.where(function() {
        this.where(mt + '.deleted', false).orWhereNull(mt + '.deleted');
      });
    };

    q.select(mt + '.' + config.pk).then(function(result) {
      var result = result.map(function(v) {
        var v = v[config.pk];
        if (embedresult) {
          var n = new self.__proto__.constructor;
          return n.load(db,v);
        } else {
          return v;
        }
      });
      if (!result) {
        fail("notfound");
      };

      Promise.all(result).then(function(results) {
        resolve(results);
      });
    });
  });
};

module.exports = Generic;
