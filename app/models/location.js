import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class LocationModel extends Model {
  @attr label;
  @attr level;

  @hasMany('administrative-unit', {
    inverse: 'locatedWithin',
    async: true,
  })
  administrativeUnits;

  @belongsTo('location', {
    inverse: 'locations',
    async: true,
  })
  locatedWithin;

  @hasMany('locations', {
    inverse: 'locatedWithin',
    async: true,
  })
  locations;

  @belongsTo('concept', {
    inverse: null,
    async: true,
  })
  exactMatch;
}
