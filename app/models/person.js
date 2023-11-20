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

  // TODO: The model type previously used here was 'mandatory', not the old
  // 'agent' (which was replaced by 'functionary')
  @hasMany('functionary', {
    inverse: 'governingAlias',
  })
  functionaries;
}
