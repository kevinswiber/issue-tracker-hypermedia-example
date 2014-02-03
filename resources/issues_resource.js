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
    .get('/{id}', this.show);
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
      var item = Issue.create({
        id: issue.id,
        title: issue.title,
        description: issue.description,
        status: issue.status,
        url: env.helpers.url.join(issue.id.toString())
      });

      issues.items.push(item)
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

    env.response.statusCode = HttpStatus.OK;
    env.format.render('issue', issue);
    next(env);
  });
};
