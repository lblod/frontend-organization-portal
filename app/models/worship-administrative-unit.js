import { belongsTo, hasMany } from '@ember-data/model';
import AdministrativeUnitModel from './administrative-unit';
import { object } from 'yup';

export default class WorshipAdministrativeUnitModel extends AdministrativeUnitModel {
  @belongsTo('recognized-worship-type', {
    inverse: null,
  })
  recognizedWorshipType;

  @hasMany('minister-position', {
    inverse: 'worshipService',
  })
  ministerPositions;

  @hasMany('local-involvement', {
    inverse: 'worshipAdministrativeUnit',
  })
  involvements;

  get validationSchema() {
    return super.validationSchema.shape({
      recognizedWorshipType: object().when(['isWorshipAdministrativeUnit'], {
        is: true,
        then: (schema) =>
          schema.relationship({
            isRequired: true,
            message: 'Selecteer een optie',
          }),
      }),
    });
  }
}
