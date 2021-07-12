import Model, { attr, belongsTo } from '@ember-data/model';

export default class MinisterConditionModel extends Model {
  @attr satisfied;
  @belongsTo('minister-conditions-criterion') criterion;
  @belongsTo('document-type-criterion') documentTypeCriterion;
}
