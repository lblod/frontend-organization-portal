import Model, { attr } from '@ember-data/model';

export default class DateOfBirthModel extends Model {
  @attr('date') date;
}
