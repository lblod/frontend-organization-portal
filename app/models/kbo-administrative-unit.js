import { belongsTo, attr } from '@ember-data/model';
import OrganizationModel from './organization';

export default class KboAdministrativeUnitModel extends OrganizationModel {
  @attr rechtsvorm;
  @attr shortName;
  @attr startDate;
  @belongsTo('administrative-unit', {
    inverse: 'kboAdministrativeUnit',
  })
  administrativeUnit;
}
