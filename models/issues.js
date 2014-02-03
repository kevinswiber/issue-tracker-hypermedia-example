var Issues = module.exports = function() {
  this.items = null;
  this.url = null;
};

Issues.create = function(example) {
  var issues = new Issues();
  issues.items = example.items;
  issues.url = example.url;

  return issues;
};
