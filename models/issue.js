var Issue = module.exports = function() {
  this.id = null;
  this.title = null;
  this.description = null;
  this.status = null;
  this.url = null;
  this.collection = null;
};

Issue.create = function(example) {
  var issue = new Issue();

  issue.id = example.id;
  issue.title = example.title;
  issue.description = example.description;
  issue.status = example.status;
  issue.url = example.url;
  issue.collection = example.collection;

  return issue;
};
