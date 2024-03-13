import { belongsTo, attr } from '@ember-data/model';
import OrganizationModel from './organization';

export default class KboAdministrativeUnitModel extends OrganizationModel {
  @attr rechtsvorm;
  @attr commercialName;
  @attr startDate;
  @belongsTo('administrative-unit', {
    inverse: 'kboAdministrativeUnit',
    async: true,
  })
  administrativeUnit;

  @belongsTo('worship-administrative-unit', {
    inverse: 'kboAdministrativeUnit',
    polymorphic: true,
    async: true,
  })
  worshipAdministrativeUnit;

  @belongsTo('representative-body', {
    inverse: 'kboAdministrativeUnit',
    async: true,
  })
  representativeBody;
}
