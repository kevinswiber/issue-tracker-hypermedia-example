var siren = require('siren-writer');

module.exports = function(model) {
  return siren.entity(model.url)
    .cls('issue')
    .properties({
      id: model.id,
      title: model.title,
      description: model.description,
      status: model.status
    })
    .link('collection', model.collection);
};

