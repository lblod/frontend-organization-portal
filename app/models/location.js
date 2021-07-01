import Model, { attr, hasMany } from '@ember-data/model';

export default class LocationModel extends Model {
  @attr label;
  @attr level;
  @hasMany('administrative-unit', { inverse: 'scope' }) administrativeUnit;
}
