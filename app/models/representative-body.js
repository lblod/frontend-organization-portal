import { belongsTo } from '@ember-data/model';
import OrganizationModel from './organization';

export default class RepresentativeBodyModel extends OrganizationModel {
  @belongsTo('recognized-worship-type') recognizedWorshipType;
}
