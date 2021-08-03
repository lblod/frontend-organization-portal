import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class AgentInPositionModel extends Model {
  @attr('date') agentStartDate;
  @attr('date') agentEndDate;

  @belongsTo('post', {
    inverse: 'agentsInPosition',
  })
  position;

  @belongsTo('person', {
    inverse: 'agentsInPosition',
  })
  person;

  @hasMany('contact-point', {
    inverse: null,
  })
  contacts;
}
