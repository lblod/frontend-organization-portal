import { attr, hasMany, belongsTo } from '@ember-data/model';
import AgentInPositionModel from './agent-in-position';

export default class MandatoryModel extends AgentInPositionModel {
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
}
