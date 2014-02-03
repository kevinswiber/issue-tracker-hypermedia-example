var siren = require('siren-writer');

module.exports = function(model) {
  var response = siren.entity(model.url)
    .cls('issue')
    .properties({
      id: model.id,
      title: model.title,
      description: model.description,
      status: model.status
    });

  if (model.actions && model.actions.length) {
    model.actions.forEach(function(action) {
      var a = siren.action(action.name, action.href)
        .title(action.title)
        .method(action.method);

      if (action.fields && action.fields.length) {
        action.fields.forEach(function(f) {
          a.field(f.name, f.type, f.value);
        });
      }

      response.action(a);
    });
  }
    
  response.link('collection', model.collection);

  return response;
};

