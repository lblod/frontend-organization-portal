import Model, { attr, belongsTo } from '@ember-data/model';

export default class AssociatedLegalStructureModel extends Model {
  @attr name;

  @belongsTo('identifier', {
    inverse: null,
  })
  registration;

  @belongsTo('legal-form-type', {
    inverse: null,
  })
  legalType;

  @belongsTo('address', {
    inverse: null,
  })
  address;
}
