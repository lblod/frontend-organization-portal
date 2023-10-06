import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
export default class ChangeEventModel extends Model {
  @attr('date') date;
  @attr description;

  @belongsTo('change-event-type', {
    inverse: null,
    async: true,
  })
  type;

  @belongsTo('decision', {
    inverse: null,
    async: true,
  })
  decision;

  @hasMany('organization', {
    inverse: 'resultedFrom',
    async: true,
    polymorphic: true,
    as: 'change-event',
  })
  resultingOrganizations;

  @hasMany('organization', {
    inverse: 'changedBy',
    async: true,
    polymorphic: true,
    as: 'change-event',
  })
  originalOrganizations;

  @hasMany('change-event-result', {
    inverse: 'resultFrom',
    async: true,
  })
  results;
}
