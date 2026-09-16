import { assert } from '@ember/debug';
import Model, { attr, hasMany } from '@warp-drive/legacy/model';
import type AdministrativeUnitClassificationCode from './administrative-unit-classification-code';
import type { Type } from '@warp-drive/core/types/symbols';

export const EXECUTIVE_ORGANEN = [
  '39854196-f214-4688-87a1-d6ad12baa2fa', // Algemeen Directeur
  '11f0af9e-016c-4e0b-983a-d8bc73804abc', // Adjunct-Algemeen Directeur
  '62644b9c-4514-41dd-a660-4c35257f2b35', // Financieel Directeur
  'ed40469e-3b6f-4f38-99ba-18912ee352b0', // Adjunct-Financieel Directeur
  '3e9f22c1-0d35-445b-8a37-494addedf2d8', // Financieel beheerder
  '5ab19107-82d2-4273-a986-3da86fda050d', // Griffier
];

export default class GoverningBodyClassificationCode extends Model {
  declare [Type]: 'governing-body-classification-code';
  @attr declare label: string;

  @hasMany<AdministrativeUnitClassificationCode>(
    'administrative-unit-classification-code',
    {
      inverse: null,
      async: true,
    },
  )
  declare appliesWithin: Promise<AdministrativeUnitClassificationCode[]>;
}

const classificationsWithUnifiedMandatories = [
  '4955bd72cd0e4eb895fdbfab08da0284', // Burgemeester
  '5ab0e9b8a3b2ca7c5e000005', // Gemeenteraad
  '5ab0e9b8a3b2ca7c5e000006', // College van Burgemeester en Schepenen

  '5ab0e9b8a3b2ca7c5e000009', // Bijzonder comite Bijzonder Comité voor de Sociale Dienst
  '5ab0e9b8a3b2ca7c5e000008', // Vast Bureau
  '5ab0e9b8a3b2ca7c5e000007', // Raad voor Maatschappelijk Welzijn
  '53c0d8cd-f3a2-411d-bece-4bd83ae2bbc9', // Voorzitter van het Bijzonder Comité voor de Sociale Dienst

  '9314533e-891f-4d84-a492-0338af104065', // Districtsburgemeester
  '5ab0e9b8a3b2ca7c5e00000a', // Districtraad
  '5ab0e9b8a3b2ca7c5e00000b', // Districtcollege

  '180a2fba-6ca9-4766-9b94-82006bb9c709', // Gouverneur
  '5ab0e9b8a3b2ca7c5e00000c', // Provincieraad
  '5ab0e9b8a3b2ca7c5e00000d', // Deputatie
];

export function hasUnifiedMandatories(
  governingBodyClassification: GoverningBodyClassificationCode,
) {
  assert(
    'The governingBodyClassification record is expected to have an id',
    governingBodyClassification.id,
  );

  return classificationsWithUnifiedMandatories.includes(
    governingBodyClassification.id,
  );
}
