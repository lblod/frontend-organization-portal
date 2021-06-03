import {hasMany, belongsTo } from '@ember-data/model';
import OrganizationModel from './organization';

export default class AdministrativeUnitModel extends OrganizationModel {
    @belongsTo('administrative-unit-classification-code') classification;
    @hasMany('governing-body', { inverse: true }) governingBodies;
    @hasMany('public-involvement', { inverse: null }) involvedBoards;
}
