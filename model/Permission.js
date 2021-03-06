'use strict';

var static_data = require('../static');
var Generic = require('./Generic');

function Permission() {
  Generic.call(this);

  this._kind = "Permission";
  this.config = {
    app_url: this.config.app_url,
    legacy_mode: this.config.legacy_mode,
    pk: 'UserID',
    parent: undefined,
    id: "PermissionTypeID",
    value: "UserPropertiesTypeValue",
    db: require('../db/perm'),
    dbs: undefined,
    blobembed: false,
    types: static_data.perm_types,
    tag_map: static_data.tag_map,
  };
};

Permission.prototype = Object.create(Generic.prototype);
Permission.prototype.constructor = Permission;

Permission.prototype.load = function(db, id) {
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

      var r = result;
      var result = [].concat.apply([], [r]);
      var merged = {};
      var value = undefined;
      var et = config.types.value();
      var result = result.map(function(v) {
        var t = v[config.id];
        var field;
        var val =  v[config.value];

        var x = {};
        var wl = et.by_id[t];
        if (wl === undefined)
          return;

        field = wl.name;
        val = v.PermissionEndValidity;
        merged[field] = val;
      });
      var result = {permissions: merged, user_id: id};
      resolve(result);
    });
  });
};


module.exports = Permission;

