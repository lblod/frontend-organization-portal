import Model, { attr, hasMany } from '@ember-data/model';

export default class VendorModel extends Model {
  @attr name;

  @hasMany('organization', {
    inverse: 'vendors',
    async: true,
    polymorphic: true,
    as: 'vendor',
  })
  organizations;
}
