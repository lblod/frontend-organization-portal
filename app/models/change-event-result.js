import Model, { belongsTo } from '@ember-data/model';

export default class ChangeEventResultModel extends Model {
  @belongsTo('organization-status-code', {
    inverse: null,
  })
  status;

  @belongsTo('change-event', { inverse: 'results' }) resultFrom;

  @belongsTo('organization', { inverse: 'changeEventResults' })
  resultingOrganization;
}
