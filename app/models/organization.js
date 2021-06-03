import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class OrganizationModel extends Model {
    @attr name;
    @attr alternativeName;
    @belongsTo('primary-site') primarySite;
    @belongsTo('organization-status-code') organizationStatus;
    @hasMany('identifier', { inverse: null }) identifiers;
    @hasMany('site', { inverse: null }) sites;
    @hasMany('change-event', { inverse: null }) changedBy;
    @hasMany('change-event', { inverse: null }) resultedFrom;
    @hasMany('post', { inverse: null }) positions;
}
