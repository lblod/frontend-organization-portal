import Model, { attr, belongsTo } from '@ember-data/model';

export default class GoverningBodyClassificationCodeModel extends Model {
  @attr label;

  @belongsTo('administrative-unit-classification-code', { inverse: null })
  appliesWithin;
}
