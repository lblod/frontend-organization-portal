import { hasMany, belongsTo } from '@ember-data/model';
import OrganizationModel from './organization';

export default class RepresentativeBodyModel extends OrganizationModel {
  @belongsTo('honorary-service-type') honoraryServiceType;
  @hasMany('central-worship-service', { inverse: 'representativeBody' })
  centralServices;
  @hasMany('worship-service', { inverse: 'representiveBody' }) worshipServices;
}
