'use strict';

var app_url = process.env.APP_URL || 'http://localhost:8080';
var static_data = require('../static');
var Generic = require('./Generic');

function User() {
  Generic.call(this);
  this.config = {
    app_url: app_url,
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
