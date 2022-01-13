import Model, { attr } from '@ember-data/model';

export const CLASSIFICATION_CODE = {
  MUNICIPALITY: '5ab0e9b8a3b2ca7c5e000001',
  PROVINCE: '5ab0e9b8a3b2ca7c5e000000',
  WORSHIP_SERVICE: '66ec74fd-8cfc-4e16-99c6-350b35012e86',
  CENTRAL_WORSHIP_SERVICE: 'f9cac08a-13c1-49da-9bcb-f650b0604054',
};

export default class AdministrativeUnitClassificationCodeModel extends Model {
  @attr label;
}
