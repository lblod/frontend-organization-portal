import { attr, hasMany } from '@ember-data/model';
import AgentModel from './agent';

export default class PersonModel extends AgentModel {
  @attr givenName;
  @attr familyName;
  @attr firstNameUsed;

  @hasMany('agent-in-position', {
    inverse: 'person',
    async: true,
  })
  agentsInPosition;

  @hasMany('mandatory', {
    inverse: 'governingAlias',
    async: true,
  })
  mandatories;

  @hasMany('functionary', {
    inverse: 'governingAlias',
    async: true,
  })
  functionaries;
}
