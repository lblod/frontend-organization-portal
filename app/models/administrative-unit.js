import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class AdministrativeUnitModel extends Model {
    @attr name;
    @attr alternativeName;
    @belongsTo('administrative-unit-classification-code') classification;
    @belongsTo('site') primarySite;
    @hasMany('identifier', { inverse: null }) identifiers;
    @hasMany('governing-body', { inverse: null }) governingBodies;
    @hasMany('contact-point', { inverse: null }) contactPoints;
    @hasMany('site', { inverse: null }) sites;
}
