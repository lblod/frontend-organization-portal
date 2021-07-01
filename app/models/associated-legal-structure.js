import Model, { attr, belongsTo } from '@ember-data/model';

export default class AssociatedLegalStructureModel extends Model {
  @attr name;
  @belongsTo('identifier') registration;
  @belongsTo('legal-form-type') legalType;
  @belongsTo('address') address;
}
