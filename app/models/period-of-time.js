import Model, { attr } from '@ember-data/model';

export default class PeriodOfTimeModel extends Model {
  @attr('date') startDate;
  @attr('date') endDate;
}
