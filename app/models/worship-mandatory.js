import { attr, belongsTo } from '@ember-data/model';
import MandatoryModel from './mandatory';
import { dashedDateFormat } from '../utils/date-format';

export default class WorshipMandatoryModel extends MandatoryModel {
  @attr('date') expectedEndDate;
  @attr reasonStopped;

  @belongsTo('half-election', {
    inverse: null,
  })
  typeHalf;

  get mandaatExpectedEndDate() {
    return dashedDateFormat(this.expectedEndDate);
  }
}
