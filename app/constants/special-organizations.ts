import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';

// Records added by backend migration, modelled like the Kabinet Crevits one.
export const FEDERALE_REGERING_ID = '382a011d-9964-4e4a-bf50-d81192e539ad';
export const VLAAMSE_REGERING_ID = '4f309543-43a2-485d-9328-7b81e5e032a1';

export const SPECIAL_RELATED_ORGANIZATION_IDS = [
  FEDERALE_REGERING_ID,
  VLAAMSE_REGERING_ID,
];

/**
 * The government that is linked automatically (founder and recognizer) to
 * newly created organizations of the classification, keyed by classification
 * id. The memberships are created by the save task of the create form.
 */
export const GOVERNMENT_ID_BY_AUTO_FILL_CLASSIFICATION = {
  // Hulpverleningszone, Politiezone -> Federale regering
  [CLASSIFICATION.ASSISTANCE_ZONE.id]: FEDERALE_REGERING_ID,
  [CLASSIFICATION.POLICE_ZONE.id]: FEDERALE_REGERING_ID,
  // Vervoerregioraad, Regionaal zorgplatform, Regionaal landschap,
  // Woonmaatschappij, Zorgraad -> Vlaamse regering
  [CLASSIFICATION.VERVOERREGIORAAD.id]: VLAAMSE_REGERING_ID,
  [CLASSIFICATION.REGIONAAL_ZORGPLATFORM.id]: VLAAMSE_REGERING_ID,
  [CLASSIFICATION.REGIONAAL_LANDSCHAP.id]: VLAAMSE_REGERING_ID,
  [CLASSIFICATION.WOONMAATSCHAPPIJ.id]: VLAAMSE_REGERING_ID,
  [CLASSIFICATION.ZORGRAAD.id]: VLAAMSE_REGERING_ID,
};
