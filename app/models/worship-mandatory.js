import { attr, belongsTo } from '@ember-data/model';
import MandatoryModel from './mandatory';

export default class WorshipMandatoryModel extends MandatoryModel {
  @attr('date') expectedEndDate;
  @attr reasonStopped;

  @belongsTo('half-election', {
    inverse: null,
    async: true,
  })
  typeHalf;
}
