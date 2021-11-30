import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class ChangeEventModel extends Model {
  @attr('date') date;
  @attr description;

  @belongsTo('change-event-type', {
    inverse: null,
  })
  type;

  @hasMany('organization', {
    inverse: 'resultedFrom',
  })
  resultingOrganization;

  @hasMany('organization', {
    inverse: 'changedBy',
  })
  originalOrganization;

  @hasMany('change-event-result', {
    inverse: 'resultFrom',
  })
  results;
}
