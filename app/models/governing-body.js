import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class GoverningBodyModel extends Model {
    @attr startDate;
    @attr endDate;
    @belongsTo('administrative-unit') administrativeUnit;
    @belongsTo('governing-body-classification-code') classification;
    @belongsTo('governing-body') isTimeSpecializationOf;
    @hasMany('governing-body', { inverse: null }) hasTimeSpecializations;
    @hasMany('mandate', { inverse: null }) contains;
}
