import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class LocationModel extends Model {
  @attr label;
  @attr level;

  @hasMany('administrative-unit', {
    inverse: 'locatedWithin',
    async: true,
    polymorphic: true,
    as: 'location',
  })
  administrativeUnits;

  @belongsTo('location', {
    inverse: 'locations',
    async: true,
  })
  locatedWithin;

  @hasMany('location', {
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
