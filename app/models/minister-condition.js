import Model, { attr, belongsTo } from '@ember-data/model';

export default class MinisterConditionModel extends Model {
  @attr satisfied;

  @belongsTo('minister-conditions-criterion', {
    inverse: null,
  })
  criterion;

  @belongsTo('document-type-criterion', {
    inverse: null,
  })
  documentTypeCriterion;
}
