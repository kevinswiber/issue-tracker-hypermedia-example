var querystring = require('querystring');

var HttpStatus = require('http-status-codes');
var MediaType = require('api-media-type');
var Query = require('calypso').Query;

var Issues = require('../models/issues');
var Issue = require('../models/issue');

var IssuesResource = module.exports = function() {
  this.path = '/issues';
};

IssuesResource.prototype.init = function(config) {
  config
    .path(this.path)
    .produces(MediaType.SIREN)
    .get('/', this.list)
    .get('/{id}', this.show)
    .post('/{id}', this.action);
};

IssuesResource.prototype.list = function(env, next) {
  var issues = Issues.create({
    items: [],
    url: env.helpers.url.current()
  });

  var query = Query.of(Issue);

  if (env.route.query.search) {
    query
      .ql('where title contains @search or description contains @search')
      .params({ search: env.route.query.search });
  }

  env.db.find(query, function(err, results) {
    results.forEach(function(issue) {
      issue.url = env.helpers.url.join(issue.id.toString());
      issues.items.push(issue)
    });

    env.format.render('issues', issues);
    next(env);
  });
};

IssuesResource.prototype.show = function(env, next) {
  var id = env.route.params.id;

  var query = Query.of(Issue);

  var self = this;
  env.db.get(query, id, function(err, issue) {
    if (!issue) {
      env.response.statusCode = HttpStatus.NOT_FOUND;
      return next(env);
    }

    issue.url = env.helpers.url.current();
    issue.collection = env.helpers.url.path(self.path);
    issue.actions = [];

    if (issue.status === 'open') {
      issue.actions.push({
        name: 'close-issue',
        method: 'POST',
        href: env.helpers.url.current(),
        fields: [ { name: 'action', type: 'hidden', value: 'close' } ]
      });
    } else if (issue.status === 'closed') {
      issue.actions.push({
        name: 'open-issue',
        method: 'POST',
        href: env.helpers.url.current(),
        fields: [ { name: 'action', type: 'hidden', value: 'open' } ]
      });
    }

    env.response.statusCode = HttpStatus.OK;
    env.format.render('issue', issue);
    next(env);
  });
};

IssuesResource.prototype.action = function(env, next) {
  env.request.getBody(function(err, body) {
    if (err || !body) {
      env.response.statusCode = HttpStatus.BAD_REQUEST;
      return next(env);
    }

    var id = env.route.params.id;

    var parsed = querystring.parse(body);

    var query = Query.of(Issue);

    env.db.get(query, id, function(err, issue) {
      if (!issue || (issue.action !== 'open' && issue.action !== 'close')) {
        env.response.statusCode = HttpStatus.NOT_FOUND;
        return next(env);
      }

      if (issue.action === 'open' && issue.status === 'closed') {
        issue.status = 'open';
      } else if (issue.action === 'close' && issue.status === 'open') {
        issue.status = 'closed';
      }

      env.db.save(query, id, issue, function(err) {
        next(env);
      });
    });
  });
};
