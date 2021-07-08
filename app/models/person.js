import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class PersonModel extends Model {
  @attr givenName;
  @attr familyName;
  @attr firstNameUsed;
  @hasMany('mandatory') mandatories;
  @hasMany('minister') ministers;
  @hasMany('nationality') nationalities;
  @belongsTo('date-of-birth') dateOfBirth;
  @belongsTo('gender-code') gender;
}
