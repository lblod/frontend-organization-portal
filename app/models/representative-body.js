import { belongsTo, hasMany } from '@ember-data/model';
import OrganizationModel from './organization';

export const BLACKLIST_RO = [
  'e224c637ba8bb0e5dfbb87da225b4652', // Executief van de Moslims van België
];

export default class RepresentativeBodyModel extends OrganizationModel {
  @belongsTo('recognized-worship-type', {
    inverse: null,
    async: true,
  })
  recognizedWorshipType;

  @hasMany('minister-positions', {
    inverse: 'representativeBody',
    async: true,
  })
  ministerPositions;

  @belongsTo('kbo-administrative-unit', {
    inverse: 'administrativeUnit',
    async: true,
  })
  kboAdministrativeUnit;
}
