import Model, { attr, belongsTo } from '@ember-data/model';

export default class MinisterConditionModel extends Model {
  @attr satisfied;

  @belongsTo('minister-conditions-criterion', {
    inverse: null,
    async: true,
  })
  criterion;

  @belongsTo('document-type-criterion', {
    inverse: null,
    async: true,
  })
  documentTypeCriterion;
}
