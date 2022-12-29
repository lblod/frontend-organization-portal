import { attr, hasMany, belongsTo } from '@ember-data/model';
import { tracked } from '@glimmer/tracking';
import AgentInPositionModel from './agent-in-position';
import { dashedDateFormat } from '../utils/date-format';

export default class MandatoryModel extends AgentInPositionModel {
  // TODO: These are only used for validations
  // We should find a better way to solve this
  @tracked isCurrentPosition;
  @tracked role;

  @attr('date') startDate;
  @attr('date') endDate;

  @belongsTo('mandatory-status-code', {
    inverse: null,
  })
  status;

  @belongsTo('person', {
    inverse: 'mandatories',
  })
  governingAlias;

  @belongsTo('mandate', {
    inverse: 'heldBy',
  })
  mandate;

  @hasMany('contact-point', {
    inverse: null,
  })
  contacts;

  get startDatum() {
    return dashedDateFormat(this.startDate);
  }

  get eindDatum() {
    return dashedDateFormat(this.endDate);
  }
}
