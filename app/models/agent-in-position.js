import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class AgentInPositionModel extends Model {
  @attr('date') agentStartDate;
  @attr('date') agentEndDate;
  @belongsTo('post') position;
  @belongsTo('person') person;
  @hasMany('contact-point') contacts;
}
