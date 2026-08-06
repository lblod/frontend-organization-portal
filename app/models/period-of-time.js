import Model, { attr } from '@warp-drive/legacy/model';

export default class PeriodOfTimeModel extends Model {
  @attr('date') startDate;
  @attr('date') endDate;
}
