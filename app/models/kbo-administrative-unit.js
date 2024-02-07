import { belongsTo, attr } from '@ember-data/model';
import OrganizationModel from './organization';

export default class KboAdministrativeUnitModel extends OrganizationModel {
  @attr rechtsvorm;
  @belongsTo('administrative-unit', {
    inverse: 'kboAdministrativeUnit',
  })
  administrativeUnit;
}
