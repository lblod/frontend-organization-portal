import { hasMany, belongsTo } from '@ember-data/model';
import OrganizationModel from './organization';

export default class AdministrativeUnitModel extends OrganizationModel {
  @belongsTo('administrative-unit-classification-code') classification;
  @belongsTo('location') scope;
  @hasMany('governing-body', { inverse: 'administrativeUnit' }) governingBodies;
  @hasMany('public-involvement', { inverse: null }) involvedBoards;
}
