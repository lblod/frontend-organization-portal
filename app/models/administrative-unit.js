import { hasMany, belongsTo } from '@ember-data/model';
import OrganizationModel from './organization';

export default class AdministrativeUnitModel extends OrganizationModel {
<<<<<<< HEAD
  @belongsTo('administrative-unit-classification-code') classification;
  @hasMany('governing-body', { inverse: 'administrativeUnit' }) governingBodies;
  @hasMany('public-involvement', { inverse: null }) involvedBoards;
=======
    @belongsTo('administrative-unit-classification-code') classification;
    @belongsTo('location') municipality;
    @belongsTo('location') province;
    @hasMany('governing-body', { inverse: 'administrativeUnit' }) governingBodies;
    @hasMany('public-involvement', { inverse: null }) involvedBoards;
>>>>>>> Update model
}
