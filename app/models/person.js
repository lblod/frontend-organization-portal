import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class PersonModel extends Model {
  @attr givenName;
  @attr familyName;
  @attr firstNameUsed;

  @hasMany('mandatory', {
    inverse: 'governingAlias',
  })
  mandatories;

  @hasMany('agent-in-position', {
    inverse: 'person',
  })
  agentsInPosition;

  @hasMany('nationality', {
    inverse: null,
  })
  nationalities;

  @belongsTo('date-of-birth', {
    inverse: null,
  })
  dateOfBirth;

  @belongsTo('gender-code', {
    inverse: null,
  })
  gender;
}
