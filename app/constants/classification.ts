//TODO: Move CLASSIFICATION to constants
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';

export const MunicipalityCodeList = [CLASSIFICATION.MUNICIPALITY.id];

export const ProvinceCodeList = [CLASSIFICATION.PROVINCE.id];

export const AgbCodeList = [CLASSIFICATION.AGB.id];

export const ApbCodeList = [CLASSIFICATION.APB.id];

export const ProjectverenigingCodeList = [CLASSIFICATION.PROJECTVERENIGING.id];
export const DienstverlenendeVerenigingCodeList = [
  CLASSIFICATION.DIENSTVERLENENDE_VERENIGING.id,
];
export const OpdrachthoudendeVerenigingCodeList = [
  CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING.id,
];
export const OpdrachthoudendeVerenigingMetPrivateDeelnameCodeList = [
  CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME.id,
];

export const IGSCodeList = [
  ...ProjectverenigingCodeList,
  ...DienstverlenendeVerenigingCodeList,
  ...OpdrachthoudendeVerenigingCodeList,
  ...OpdrachthoudendeVerenigingMetPrivateDeelnameCodeList,
];

export const PoliceZoneCodeList = [CLASSIFICATION.POLICE_ZONE.id];

export const AssistanceZoneCodeList = [CLASSIFICATION.ASSISTANCE_ZONE.id];

export const WorshipServiceCodeList = [CLASSIFICATION.WORSHIP_SERVICE.id];

export const CentralWorshipServiceCodeList = [
  CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
];

export const RepresentativeBodyCodeList = [
  CLASSIFICATION.REPRESENTATIVE_BODY.id,
];

export const OCMWCodeList = [CLASSIFICATION.OCMW.id];

export const WelzijnsverenigingCodeList = [
  CLASSIFICATION.WELZIJNSVERENIGING.id,
];
export const AutonomeVerzorgingsinstellingCodeList = [
  CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING.id,
];
export const ZiekenhuisverenigingCodeList = [
  CLASSIFICATION.ZIEKENHUISVERENIGING.id,
];
export const VerenigingOfVennootschapVoorSocialeDienstverleningCodeList = [
  CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING.id,
];
export const WoonzorgverenigingCodeList = [
  CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP.id,
];

export const PrivateOcmwAssociationCodeList = [
  ...ZiekenhuisverenigingCodeList,
  ...VerenigingOfVennootschapVoorSocialeDienstverleningCodeList,
  ...WoonzorgverenigingCodeList,
];

export const OcmwAssociationCodeList = [
  ...WelzijnsverenigingCodeList,
  ...AutonomeVerzorgingsinstellingCodeList,
  ...PrivateOcmwAssociationCodeList,
];

export const DistrictCodeList = [CLASSIFICATION.DISTRICT.id];

export const PevaMunicipalityCodeList = [CLASSIFICATION.PEVA_MUNICIPALITY.id];
export const PevaProvinceCodeList = [CLASSIFICATION.PEVA_PROVINCE.id];

export const AndereCodeList = [CLASSIFICATION.ANDERE.id];

export const VlaamseGemeenschapscommissieCodeList = [
  CLASSIFICATION.VLAAMSE_GEMEENSCHAPSCOMMISSIE.id,
];

export const InterlokaleVerenigingCodeList = [
  CLASSIFICATION.INTERLOKALE_VERENIGING.id,
];
export const VervoerregioraadCodeList = [CLASSIFICATION.VERVOERREGIORAAD.id];
export const ZorgraadCodeList = [CLASSIFICATION.ZORGRAAD.id];
export const RegionaalZorgplatformCodeList = [
  CLASSIFICATION.REGIONAAL_ZORGPLATFORM.id,
];
export const RegionaalLandschapCodeList = [
  CLASSIFICATION.REGIONAAL_LANDSCHAP.id,
];
export const BosgroepCodeList = [CLASSIFICATION.BOSGROEP.id];
export const WoonmaatschappijCodeList = [CLASSIFICATION.WOONMAATSCHAPPIJ.id];

// The ABB classification the two special organizations get: they are
// modelled as bestuurseenheden of this code, like the Kabinet Crevits record.
// Not an entry of the CLASSIFICATION constant, so it never shows up in the
// classification selects.
export const ABB_CLASSIFICATION_ID = '52cc9d8d-1c9a-4d92-9936-da9d4a622ec4';

/**
  The field is required only in non-worship services, in all types of organisations except for:
  - gemeente
  - OCMW
  - district
  - provincie
  - politiezone
  - hulpverleningszone
  - vervoerregio’s
  - eerstelijnszones
  - regionale zorgzones
  - regionale landschappen
  - bosgroepen
  - woonmaatschappijen
  */
export const CLASSIFICATION_CODES_WITHOUT_ADDITIONAL_QUALIFICATIONS = [
  ...MunicipalityCodeList,
  ...OCMWCodeList,
  ...DistrictCodeList,
  ...ProvinceCodeList,
  ...PoliceZoneCodeList,
  ...AssistanceZoneCodeList,
  ...VervoerregioraadCodeList,
  ...ZorgraadCodeList,
  ...RegionaalZorgplatformCodeList,
  ...RegionaalLandschapCodeList,
  ...BosgroepCodeList,
  ...WoonmaatschappijCodeList,
  // Worship organizations
  ...WorshipServiceCodeList,
  ...CentralWorshipServiceCodeList,
];
