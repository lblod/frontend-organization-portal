import Model, { attr } from '@ember-data/model';

export const CLASSIFICATION_CODE = {
  MUNICIPALITY: '5ab0e9b8a3b2ca7c5e000001',
  PROVINCE: '5ab0e9b8a3b2ca7c5e000000',
};

export default class AdministrativeUnitClassificationCodeModel extends Model {
  @attr label;
}
