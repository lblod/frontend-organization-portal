import Model, { attr, hasMany } from '@ember-data/model';

export const EXECUTIVE_ORGANEN = [
  '39854196-f214-4688-87a1-d6ad12baa2fa', // Algemeen Directeur
  '11f0af9e-016c-4e0b-983a-d8bc73804abc', // Adjunct-Algemeen Directeur
  '62644b9c-4514-41dd-a660-4c35257f2b35', // Financieel Directeur
  'ed40469e-3b6f-4f38-99ba-18912ee352b0', // Adjunct-Financieel Directeur
  '3e9f22c1-0d35-445b-8a37-494addedf2d8', // Financieel beheerder
  '5ab19107-82d2-4273-a986-3da86fda050d', // Griffier
];

export default class GoverningBodyClassificationCodeModel extends Model {
  @attr label;

  @hasMany('administrative-unit-classification-code', {
    inverse: null,
    async: true,
  })
  appliesWithin;
}
