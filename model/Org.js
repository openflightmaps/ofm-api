'use strict';

var static_data = require('../static');
var Generic = require('./Generic');

function User() {
  Generic.call(this);

  this.kind = "User";
  this.config = {
    app_url: this.config.app_url,
    legacy_mode: this.config.legacy_mode,
    pk: 'OrganizationID',
    parent: undefined,
    id: "UserPropertiesTypeID",
    value: "UserPropertiesTypeValue",
    db: require('../db/org'),
    dbs: undefined,
    blobembed: true,
    types: static_data.up_types, // UserPropertiesTypeID
  };
};

User.prototype = Object.create(Generic.prototype);
User.prototype.constructor = User;

module.exports = User;

