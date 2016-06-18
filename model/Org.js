'use strict';

var static_data = require('../static');
var Generic = require('./Generic');

function Org() {
  Generic.call(this);

  this.kind = "Organization";
  this.config = {
    app_url: this.config.app_url,
    legacy_mode: this.config.legacy_mode,
    pk: 'OrganizationID',
    parent: undefined,
    id: "UserPropertiesTypeID",
    value: "UserPropertiesTypeValue",
    db: require('../db/org'),
    dbs: static_data.org_dbs,
    blobembed: true,
    types: static_data.up_types, // UserPropertiesTypeID
    tag_map: static_data.tag_map,
  };
};

Org.prototype = Object.create(Generic.prototype);
Org.prototype.constructor = Org;

module.exports = Org;

