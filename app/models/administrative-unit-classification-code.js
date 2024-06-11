import { ORGANIZATION_TYPES } from '../constants/organization-types';
import OrganizationClassificationCodeModel from './organization-classification-code';

export const CLASSIFICATION = {
  MUNICIPALITY: {
    id: '5ab0e9b8a3b2ca7c5e000001',
    label: 'Gemeente',
    organizationType: ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT,
  },
  PROVINCE: {
    id: '5ab0e9b8a3b2ca7c5e000000',
    label: 'Provincie',
    organizationType: ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT,
  },
  OCMW: {
    id: '5ab0e9b8a3b2ca7c5e000002',
    label: 'OCMW',
    organizationType: ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT,
  },
  DISTRICT: {
    id: '5ab0e9b8a3b2ca7c5e000003',
    label: 'District',
    organizationType: ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT,
  },
  WORSHIP_SERVICE: {
    id: '66ec74fd-8cfc-4e16-99c6-350b35012e86',
    label: 'Bestuur van de eredienst',
    organizationType: ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT,
  },
  CENTRAL_WORSHIP_SERVICE: {
    id: 'f9cac08a-13c1-49da-9bcb-f650b0604054',
    label: 'Centraal bestuur van de eredienst',
    organizationType: ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT,
  },
  AGB: {
    id: '36a82ba0-7ff1-4697-a9dd-2e94df73b721',
    label: 'Autonoom gemeentebedrijf',
    organizationType: ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT,
  },
  APB: {
    id: '80310756-ce0a-4a1b-9b8e-7c01b6cc7a2d',
    label: 'Autonoom provinciebedrijf',
    organizationType: ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT,
  },
  PROJECTVERENIGING: {
    id: 'b156b67f-c5f4-4584-9b30-4c090be02fdc',
    label: 'Projectvereniging',
    organizationType: ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT,
  },
  DIENSTVERLENENDE_VERENIGING: {
    id: 'd01bb1f6-2439-4e33-9c25-1fc295de2e71',
    label: 'Dienstverlenende vereniging',
    organizationType: ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT,
  },
  OPDRACHTHOUDENDE_VERENIGING: {
    id: 'cd93f147-3ece-4308-acab-5c5ada3ec63d',
    label: 'Opdrachthoudende vereniging',
    organizationType: ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT,
  },
  OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME: {
    id: '4b8450cf-a326-4c66-9e63-b4ec10acc7f6',
    label: 'Opdrachthoudende vereniging met private deelname',
    organizationType: ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT,
  },
  POLICE_ZONE: {
    id: 'a3922c6d-425b-474f-9a02-ffb71a436bfc',
    label: 'Politiezone',
    organizationType: ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT,
  },
  ASSISTANCE_ZONE: {
    id: 'ea446861-2c51-45fa-afd3-4e4a37b71562',
    label: 'Hulpverleningszone',
    organizationType: ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT,
  },
  REPRESENTATIVE_BODY: {
    id: '89a00b5a-024f-4630-a722-65a5e68967e5',
    label: 'Representatief orgaan',
    // FIXME this is not an administrative unit
    organizationType: ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT,
  },
  WELZIJNSVERENIGING: {
    id: 'e8294b73-87c9-4fa2-9441-1937350763c9',
    label: 'Welzijnsvereniging',
    organizationType: ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT,
  },
  AUTONOME_VERZORGINGSINSTELLING: {
    id: '34b5af85-dc9f-468f-9e03-ef89b174c267',
    label: 'Autonome verzorgingsinstelling',
    organizationType: ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT,
  },
  ZIEKENHUISVERENIGING: {
    // FIXME this is not an administrative unit
    id: '82250452-83a0-48f4-89cc-b430320493ce',
    label: 'Ziekenhuisvereniging',
    organizationType: ORGANIZATION_TYPES.ASSOCIATION,
  },
  VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING: {
    // FIXME this is not an administrative unit
    id: '35833ba2-7371-400b-8df2-2912f66fb153',
    label: 'Vereniging of vennootschap voor sociale dienstverlening',
    organizationType: ORGANIZATION_TYPES.ASSOCIATION,
  },
  WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP: {
    // FIXME this is not an administrative unit
    id: '82fd21dc-e8bb-4d13-a010-f4a12358ef10',
    label: 'Woonzorgvereniging of woonzorgvennootschap',
    organizationType: ORGANIZATION_TYPES.ASSOCIATION,
  },
  ASSOCIATION_OTHER: {
    // FIXME this is not an administrative unit
    id: '3e5c8e30-95a7-47b0-b0a4-210d5bd440a7',
    label: 'Ander type vereniging',
    organizationType: ORGANIZATION_TYPES.ASSOCIATION,
  },
  CORPORATION_OTHER: {
    // FIXME this is not an administrative unit
    id: 'b9ed22af-3661-4c3e-b07f-b641d80ebf61',
    label: 'Vennootschap',
    organizationType: ORGANIZATION_TYPES.CORPORATION,
  },
  PEVA_MUNICIPALITY: {
    id: '2ad46df5-5c79-4d67-84d5-604c1377231e',
    label: 'PEVA gemeente',
    organizationType: ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT,
  },
  PEVA_PROVINCE: {
    id: '088784b6-e188-48bf-b94f-94665f9e1f53',
    label: 'PEVA provincie',
    organizationType: ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT,
  },
};

export default class AdministrativeUnitClassificationCodeModel extends OrganizationClassificationCodeModel {}
