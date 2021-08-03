import { belongsTo } from '@ember-data/model';
import AdministrativeUnitModel from './administrative-unit';

export default class WorshipAdministrativeUnitModel extends AdministrativeUnitModel {
  @belongsTo('recognized-worship-type', {
    inverse: null,
  })
  recognizedWorshipType;
}
