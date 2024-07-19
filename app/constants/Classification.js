//TODO: Move CLASSIFICATION to constants
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';

export const MunicipalityCodeList = [CLASSIFICATION.MUNICIPALITY.id];

export const ProvinceCodeList = [CLASSIFICATION.PROVINCE.id];

export const AgbCodeList = [CLASSIFICATION.AGB.id];

export const ApbCodeList = [CLASSIFICATION.APB.id];

export const IGSCodeList = [
  CLASSIFICATION.PROJECTVERENIGING.id,
  CLASSIFICATION.DIENSTVERLENENDE_VERENIGING.id,
  CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING.id,
  CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME.id,
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

export const PrivateOcmwAssociationCodeList = [
  CLASSIFICATION.ZIEKENHUISVERENIGING.id,
  CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING.id,
  CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP.id,
];
export const OcmwAssociationCodeList = [
  CLASSIFICATION.WELZIJNSVERENIGING.id,
  CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING.id,
  ...PrivateOcmwAssociationCodeList,
];

export const DistrictCodeList = [CLASSIFICATION.DISTRICT.id];

export const PevaMunicipalityCodeList = [CLASSIFICATION.PEVA_MUNICIPALITY.id];
export const PevaProvinceCodeList = [CLASSIFICATION.PEVA_PROVINCE.id];
export const PevaCodeList = [
  ...PevaMunicipalityCodeList,
  ...PevaProvinceCodeList,
];

export const AssociationOtherCodeList = [CLASSIFICATION.ASSOCIATION_OTHER.id];
export const CorporationOtherCodeList = [CLASSIFICATION.CORPORATION_OTHER.id];
