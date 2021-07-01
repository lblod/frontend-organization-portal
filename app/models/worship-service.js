import { attr, belongsTo, hasMany } from '@ember-data/model';
import AdministrativeUnitModel from './administrative-unit';

export default class WorshipServiceModel extends AdministrativeUnitModel {
  @attr denomination;
  @attr crossBorder;
  @belongsTo('honorary-service-type') honoraryServiceType;
  @hasMany('local-involvement', { inverse: 'administrativeUnit' }) involvements;
  @hasMany('associated-legal-structure') associatedStructure;

  get crossBorderNominal() {
    if (this.crossBorder) {
      return 'Ja';
    } else {
      return 'Nee';
    }
  }
}
