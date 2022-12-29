import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { dashedDateFormat } from '../utils/date-format';
export default class ChangeEventModel extends Model {
  @attr('date') date;
  @attr description;

  @belongsTo('change-event-type', {
    inverse: null,
  })
  type;

  @belongsTo('decision', {
    inverse: null,
  })
  decision;

  @hasMany('organization', {
    inverse: 'resultedFrom',
  })
  resultingOrganizations;

  @hasMany('organization', {
    inverse: 'changedBy',
  })
  originalOrganizations;

  @hasMany('change-event-result', {
    inverse: 'resultFrom',
  })
  results;

  get changeDate() {
    return dashedDateFormat(this.date);
  }
}
