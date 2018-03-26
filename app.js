'use strict';
require('dotenv').config({silent: true});

var SwaggerExpress = require('swagger-express-mw');
var app = require('express')();
module.exports = app; // for testing

var config = {
  swaggerSecurityHandlers: {
    BasicAuth: function (req, authOrSecDef, scopes, callback) {
      console.log('auth:' + req.headers.authorization);
      let prefix = 'Basic ';
      if (req.headers.authorization && req.headers.authorization.startsWith(prefix)) {
        let value = req.headers.authorization.substr(prefix.length);
      }
      callback();
    }
  },
  appRoot: __dirname // required config
};

// health check
app.use('^/$', require('express-healthcheck')());
app.use('^/health$', require('express-healthcheck')());

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // enable swagger-ui
  var swaggerUiMiddleware = require('swagger-ui-middleware');
  swaggerUiMiddleware.hostUI(app, {path: '/api-doc', overrides: __dirname+'/swagger-ui'});

  // install middleware
  swaggerExpress.register(app);

  var port = process.env.PORT || 8080;
  app.listen(port);
});
