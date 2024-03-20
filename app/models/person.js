import { attr, hasMany } from '@ember-data/model';
import AgentModel from './agent';

export default class PersonModel extends AgentModel {
  @attr givenName;
  @attr familyName;
  @attr firstNameUsed;

  @hasMany('agent-in-position', {
    inverse: 'person',
    async: true,
    polymorphic: true,
    as: 'person',
  })
  agentsInPosition;

  @hasMany('mandatory', {
    inverse: 'governingAlias',
    async: true,
    polymorphic: true,
    as: 'person',
  })
  mandatories;

  @hasMany('functionary', {
    inverse: 'governingAlias',
    async: true,
  })
  functionaries;
}
