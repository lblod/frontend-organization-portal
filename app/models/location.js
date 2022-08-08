import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class LocationModel extends Model {
  @attr label;
  @attr level;

  @hasMany('administrative-unit', {
    inverse: 'locatedWithin',
  })
  administrativeUnits;

  @belongsTo('location', {
    inverse: 'locations',
  })
  locatedWithin;

  @hasMany('locations', {
    inverse: 'locatedWithin',
  })
  locations;
}
