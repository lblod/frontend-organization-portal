import {hasMany, belongsTo } from '@ember-data/model';
import AdministrativeUnitModel from './administrative-unit';

export default class CentralWorshipServiceModel extends AdministrativeUnitModel {
    @belongsTo('honorary-service-type') honoraryServiceType;
    @belongsTo('representative-body') representativeBody;
    @hasMany('worship-service', { inverse: 'centralService' }) worshipServices;
}
