import Model, { belongsTo } from '@ember-data/model';

export default class ChangeEventResultModel extends Model {
  @belongsTo('organization-status-code', {
    inverse: null,
    async: true,
  })
  status;

  @belongsTo('change-event', {
    inverse: 'results',
    async: true,
  })
  resultFrom;

  @belongsTo('organization', {
    inverse: 'changeEventResults',
    async: true,
    polymorphic: true,
    as: 'change-event-result',
  })
  resultingOrganization;
}
