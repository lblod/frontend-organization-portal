import {belongsTo } from '@ember-data/model';
import AdministrativeUnitModel from './administrative-unit';

export default class WorshipServiceModel extends AdministrativeUnitModel {
    @belongsTo('eredienst-type') eredienstType;
}
