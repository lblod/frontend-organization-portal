//TODO: Move CLASSIFICATION_CODE to constants
import {
  CLASSIFICATION_CODE,
  OCMW_ASSOCIATION_CLASSIFICATION_CODES,
} from 'frontend-organization-portal/models/administrative-unit-classification-code';

export const MunicipalityCodeList = [CLASSIFICATION_CODE.MUNICIPALITY];

export const ProvinceCodeList = [CLASSIFICATION_CODE.PROVINCE];

export const AgbCodeList = [CLASSIFICATION_CODE.AGB];

export const ApbCodeList = [CLASSIFICATION_CODE.APB];

export const IGSCodeList = [
  CLASSIFICATION_CODE.PROJECTVERENIGING,
  CLASSIFICATION_CODE.DIENSTVERLENENDE_VERENIGING,
  CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING,
  CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
];

export const PoliceZoneCodeList = [CLASSIFICATION_CODE.POLICE_ZONE];

export const AssistanceZoneCodeList = [CLASSIFICATION_CODE.ASSISTANCE_ZONE];

export const WorshipServiceCodeList = [CLASSIFICATION_CODE.WORSHIP_SERVICE];

export const CentralWorshipServiceCodeList = [
  CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE,
];

export const RepresentativeOrganCodeList = [
  CLASSIFICATION_CODE.REPRESENTATIVE_ORGAN,
];

export const OCMWCodeList = [CLASSIFICATION_CODE.OCMW];
export const OcmwAssociationCodeList = OCMW_ASSOCIATION_CLASSIFICATION_CODES;

export const DistrictCodeList = [CLASSIFICATION_CODE.DISTRICT];

export const PevaMunicipalityCodeList = [CLASSIFICATION_CODE.PEVA_MUNICIPALITY];
export const PevaProvinceCodeList = [CLASSIFICATION_CODE.PEVA_PROVINCE];
