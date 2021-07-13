import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class PersonModel extends Model {
  @attr givenName;
  @attr familyName;
  @attr firstNameUsed;
  @hasMany('mandatory', { inverse: 'governingAlias' }) mandatories;
  @hasMany('agent-in-position', { inverse: 'person' }) agentsInPosition;
  @hasMany('nationality') nationalities;
  @belongsTo('date-of-birth') dateOfBirth;
  @belongsTo('gender-code') gender;
}
