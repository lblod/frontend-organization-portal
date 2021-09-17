import { attr, hasMany } from '@ember-data/model';
import WorshipAdministrativeUnitModel from './worship-administrative-unit';

export default class WorshipServiceModel extends WorshipAdministrativeUnitModel {
  @attr denomination;
  @attr crossBorder;

  @hasMany('minister-position', {
    inverse: 'worshipService',
  })
  ministerPositions;

  @hasMany('local-involvement', {
    inverse: 'worshipService',
  })
  involvements;

  @hasMany('associated-legal-structure') associatedStructures;

  get crossBorderNominal() {
    if (this.crossBorder) {
      return 'Ja';
    } else {
      return 'Nee';
    }
  }
}
