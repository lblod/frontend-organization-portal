import Model, { attr, hasMany } from '@ember-data/model';

export const EXECUTIVE_ORGANEN = [
  '39854196-f214-4688-87a1-d6ad12baa2fa', // Algemeen Directeur
  '11f0af9e-016c-4e0b-983a-d8bc73804abc', // Adjunct-Algemeen Directeur
  '62644b9c-4514-41dd-a660-4c35257f2b35', // Financieel Directeur
  'ed40469e-3b6f-4f38-99ba-18912ee352b0', // Adjunct-Financieel Directeur
  '3e9f22c1-0d35-445b-8a37-494addedf2d8', // Financieel beheerder
  '5ab19107-82d2-4273-a986-3da86fda050d', // Griffier
];

export const GOVERNING_BODY_CLASSIFICATION = {
  CHURCH_COUNCIL: '04f65457bf125b2dc59fd71917ac3d08',
  CATHEDRAL_CHURCH_COUNCIL: 'a0701624aefb115b7eda2ff39139c2dd',
  BOARD_OF_DIRECTORS: '90a9ec83cb93b9369bba7ff29d9ce5ce',
  COMMITTEE: 'b475fa47e17a8a05ae04a9e1fb9c9258',
  CHURCH_FACTORY_COUNCIL: 'af811edba97c6ec34874d0830cbb1183',
  CENTRAL_ADMINISTRATION: '4393389e99127b68e7fc11936ba92e18',
  CENTRAL_CHURCH_BOARD: '0d985699479162198b889f10e4f1a8ce',
};

export default class GoverningBodyClassificationCodeModel extends Model {
  @attr label;

  @hasMany('administrative-unit-classification-code', { inverse: null })
  appliesWithin;
}
