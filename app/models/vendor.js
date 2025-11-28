import Model, { attr, hasMany } from '@ember-data/model';

export default class VendorModel extends Model {
  @attr name;

  @hasMany('worship-service', {
    inverse: 'vendor',
    async: true,
  })
  worshipServices;
}
