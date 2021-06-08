import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class GoverningBodyModel extends Model {
    @attr startDate;
    @attr endDate;
    @belongsTo('administrative-unit') administrativeUnit;
    @belongsTo('governing-body-classification-code', { inverse: null }) classification;
    @belongsTo('governing-body') isTimeSpecializationOf;
    @hasMany('governing-body', { inverse: 'isTimeSpecializationOf' }) hasTimeSpecializations;
    @hasMany('mandate') mandates;
}
