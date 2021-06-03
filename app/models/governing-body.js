import { attr, hasMany, belongsTo } from '@ember-data/model';
import OrganizationModel from './organization';

export default class GoverningBodyModel extends OrganizationModel {
    @attr startDate;
    @attr endDate;
    @belongsTo('administrative-unit') administrativeUnit;
    @belongsTo('governing-body-classification-code') classification;
    @belongsTo('governing-body') isTimeSpecializationOf;
    @hasMany('governing-body', { inverse: true }) hasTimeSpecializations;
    @hasMany('mandate', { inverse: null }) mandates;
}
