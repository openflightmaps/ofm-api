'use strict';

var static_data = require('../static');
var Generic = require('./Generic');

function User() {
  Generic.call(this);

  this._kind = "User";
  this.config = {
    app_url: this.config.app_url,
    legacy_mode: this.config.legacy_mode,
    pk: 'UserID',
    parent: undefined,
    id: "UserPropertiesTypeID",
    value: "UserPropertiesTypeValue",
    db: require('../db/user'),
    dbs: static_data.user_dbs,
    blobembed: false,
    types: static_data.up_types, // UserPropertiesTypeID
    tag_map: static_data.tag_map,
  };
};

User.prototype = Object.create(Generic.prototype);
User.prototype.constructor = User;

User.prototype.loadu2o = function(db, id) {
  var self = this;
  var config = self.config;
  return new Promise(function(resolve, reject) {
    var k = config.db('u1_o1a').where('UserId', id);
    if (config.parent) {
      var db_id = config.dbs.value().by_name[db].id;
      k.where(config.parent, db_id);
    }
    k.select().then(function(result) {
      if (!result || result.length == 0) {
        reject({code: "notfound", message: "not found"});
        return;
      }
      var result = [].concat.apply([], result.map(function(x) {return x.OrganizationID}));
      var attributes = result[0];
      resolve(result);
    });
  });
};

module.exports = User;

