import { attr, hasMany, belongsTo } from '@ember-data/model';
import AgentInPositionModel from './agent-in-position';
export default class MandatoryModel extends AgentInPositionModel {
  @attr('date') startDate;
  @attr('date') endDate;
  @belongsTo('mandatory-status-code') status;
  @belongsTo('person') governingAlias;
  @belongsTo('mandate') mandate;
  @hasMany('contact-point') contacts;
}
