var url = require('url');
var db_url = url.parse(process.env.DATABASE_URL || "mysql://root:root@localhost:3306/ofm");

var knex = require('knex')({
  client: db_url.protocol.substr(0, db_url.protocol.length - 1),
  connection: {
    host     : db_url.host.substr(0, db_url.host.indexOf(':')),
    port     : db_url.host.substr(db_url.host.indexOf(':') + 1, db_url.host.length),
    user     : db_url.auth.substr(0, db_url.auth.indexOf(':')),
    password : db_url.auth.substr(db_url.auth.indexOf(':') + 1, db_url.auth.length),
    database : db_url.path.substr(1),
    charset  : 'utf8'
  }
});

module.exports = require('bookshelf')(knex);

