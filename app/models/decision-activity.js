import Model, { attr, hasMany } from '@ember-data/model';
import { dashedDateFormat } from '../utils/date-format';

export default class DecisionActivityModel extends Model {
  @attr('date') endDate;

  @hasMany('decision', {
    inverse: 'hasDecisionActivity',
  })
  givesCauseTo;

  get eindDatum() {
    return dashedDateFormat(this.endDate);
  }
}
