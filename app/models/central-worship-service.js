import { belongsTo } from '@ember-data/model';
import AdministrativeUnitModel from './administrative-unit';

export default class CentralWorshipServiceModel extends AdministrativeUnitModel {
  @belongsTo('honorary-service-type') honoraryServiceType;
}
