import Model, { attr, hasMany, belongsTo } from '@ember-data/model';
export default class AgentInPositionModel extends Model {
  @attr('date') agentStartDate;
  @attr('date') agentEndDate;

  @belongsTo('post', {
    inverse: 'agentsInPosition',
    async: true,
    polymorphic: true,
    as: 'agent-in-position',
  })
  position;

  @belongsTo('person', {
    inverse: 'agentsInPosition',
    async: true,
    polymorphic: true,
    as: 'agent-in-position',
  })
  person;

  @hasMany('contact-point', {
    inverse: null,
    async: true,
  })
  contacts;
}
