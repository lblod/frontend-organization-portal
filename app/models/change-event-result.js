import Model, { attr, belongsTo, hasMany } from '@warp-drive/legacy/model';

export default class ChangeEventResultModel extends Model {
  @attr resultingName;

  @belongsTo('organization-status-code', {
    inverse: null,
    async: true,
  })
  status;

  @belongsTo('concept', {
    inverse: null,
    async: true,
  })
  resultingLegalForm;

  @belongsTo('location', {
    inverse: null,
    async: false,
  })
  resultingScope;

  @hasMany('additional-qualification-code', {
    inverse: null,
    async: false,
  })
  resultingAdditionalQualifications;

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
