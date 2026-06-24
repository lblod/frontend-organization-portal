import Model, { attr, belongsTo } from '@ember-data/model';

export default class ConceptsModel extends Model {
  @attr label;
  @attr altLabel;
  @attr notation;
  @attr('number') order;

  @belongsTo('concept-scheme', {
    inverse: null,
    async: true,
  })
  inScheme;
}
