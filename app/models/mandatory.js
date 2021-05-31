import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class MandatoryModel extends Model {
    @attr startDate;
    @attr endDate;
    @belongsTo('mandatory-status-code') status;
    @belongsTo('person') governingAlias;
    @hasMany('contact-point', { inverse: null }) contactPoints;
    @hasMany('mandate', { inverse: null }) mandates;
}
