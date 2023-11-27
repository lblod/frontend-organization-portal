import { attr, hasMany } from '@ember-data/model';
import AgentModel from './agent';

export default class PersonModel extends AgentModel {
  @attr givenName;
  @attr familyName;
  @attr firstNameUsed;

  @hasMany('agent-in-position', {
    inverse: 'person',
  })
  agentsInPosition;

  @hasMany('mandatory', {
    inverse: 'governingAlias',
  })
  mandatories;

  @hasMany('functionary', {
    inverse: 'governingAlias',
  })
  functionaries;
}
