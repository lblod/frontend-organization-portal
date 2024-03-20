import { attr, hasMany, belongsTo } from '@ember-data/model';
import AgentModel from './agent';

export default class AgentInPositionModel extends AgentModel {
  @attr('date') agentStartDate;
  @attr('date') agentEndDate;

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
