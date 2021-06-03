import {attr, belongsTo } from '@ember-data/model';
import MandatoryModel from './mandatory';

export default class WorshipMandatoryModel extends MandatoryModel {
    @attr expectedEndDate
    @attr reasonStopped
    @belongsTo('half-election') typeHalf
}
