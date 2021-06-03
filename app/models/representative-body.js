import {hasMany, belongsTo } from '@ember-data/model';
import OrganizationModel from './organization';

export default class RepresentativeBodyModel extends OrganizationModel {
    @belongsTo('honorary-service-type') honoraryServiceType;
    @hasMany('central-worship-service', { inverse: true }) centralServices;
    @hasMany('worship-service', { inverse: true }) worshipServices;
}