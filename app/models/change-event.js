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
    polymorphic: true,
    async: true,
  })
  resultingOrganizations;

  @hasMany('organization', {
    inverse: 'changedBy',
    polymorphic: true,
    async: true,
  })
  originalOrganizations;

  @hasMany('change-event-result', {
    inverse: 'resultFrom',
    async: true,
  })
  results;
}
