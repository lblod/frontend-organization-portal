import Model, { attr, hasMany } from '@ember-data/model';

export default class PersonModel extends Model {
  @attr givenName;
  @attr familyName;
  @attr firstNameUsed;

  @hasMany('mandatory', {
    inverse: 'governingAlias',
    async: true,
  })
  mandatories;

  @hasMany('agent', {
    inverse: 'governingAlias',
    async: true,
  })
  agents;

  @hasMany('agent-in-position', {
    inverse: 'person',
    async: true,
  })
  agentsInPosition;
}
