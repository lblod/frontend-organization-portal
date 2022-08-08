import Model, { attr } from '@ember-data/model';

export const CLASSIFICATION_CODE = {
  MUNICIPALITY: '5ab0e9b8a3b2ca7c5e000001',
  PROVINCE: '5ab0e9b8a3b2ca7c5e000000',
  OCMW: '5ab0e9b8a3b2ca7c5e000002',
  DISTRICT: '5ab0e9b8a3b2ca7c5e000003',
  WORSHIP_SERVICE: '66ec74fd-8cfc-4e16-99c6-350b35012e86',
  CENTRAL_WORSHIP_SERVICE: 'f9cac08a-13c1-49da-9bcb-f650b0604054',
};

export const CLASSIFICATION = {
  MUNICIPALITY: {
    id: '5ab0e9b8a3b2ca7c5e000001',
    label: 'Gemeente',
  },
  PROVINCE: {
    id: '5ab0e9b8a3b2ca7c5e000000',
    label: 'Provincie',
  },
  OCMW: {
    id: '5ab0e9b8a3b2ca7c5e000002',
    label: 'OCMW',
  },
  DISTRICT: {
    id: '5ab0e9b8a3b2ca7c5e000003',
    label: 'District',
  },
  WORSHIP_SERVICE: {
    id: '66ec74fd-8cfc-4e16-99c6-350b35012e86',
    label: 'Bestuur van de eredienst',
  },
  CENTRAL_WORSHIP_SERVICE: {
    id: 'f9cac08a-13c1-49da-9bcb-f650b0604054',
    label: 'Centraal bestuur van de eredienst',
  },
};

export default class AdministrativeUnitClassificationCodeModel extends Model {
  @attr label;
}
