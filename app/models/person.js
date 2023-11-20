import Model, { attr, hasMany } from '@ember-data/model';

export default class PersonModel extends Model {
  @attr givenName;
  @attr familyName;
  @attr firstNameUsed;

  @hasMany('mandatory', {
    inverse: 'governingAlias',
  })
  mandatories;

  // TODO: The model type previously used here was  'mandatory', not 'agent'
  @hasMany('functionary', {
    inverse: 'governingAlias',
  })
  functionaries;

  @hasMany('agent-in-position', {
    inverse: 'person',
  })
  agentsInPosition;
}
