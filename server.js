var argo = require('argo');
var calypso = require('calypso');
var MongoDriver = require('calypso-mongodb');
var titan = require('titan');
var siren = require('argo-formatter-siren');

var Issue = require('./models/issue');

var engine = calypso.configure({
  driver: MongoDriver.create({
    uri: process.env.DB_URI || 'mongodb://localhost:27017/issue-tracker'
  }),
  mappings: [
    function(mapping) {
      mapping
        .of(Issue)
        .at('issues')
        .map('id', { to: '_id' })
        .map('title')
        .map('description')
        .map('status');
    }
  ]
});

engine.build(function(err, connection) {
  argo()
    .use(titan)
    .logger()
    .allow('*')
    .use(function(handle) {
      handle('request', function(env, next) {
        env.db = connection.createSession();
        next(env);
      });
    })
    .load()
    .format({
      directory: __dirname + '/representations',
      engines: [siren],
      override: {
        'application/json': siren
      }
    })
    .listen(3000);
});
