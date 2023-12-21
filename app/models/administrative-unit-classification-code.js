import { attr } from '@ember-data/model';
import OrganizationClassificationCodeModel from './organization-classification-code';

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
  AGB: {
    id: '36a82ba0-7ff1-4697-a9dd-2e94df73b721',
    label: 'Autonoom gemeentebedrijf',
  },
  APB: {
    id: '80310756-ce0a-4a1b-9b8e-7c01b6cc7a2d',
    label: 'Autonoom provinciebedrijf',
  },
  PROJECTVERENIGING: {
    id: 'b156b67f-c5f4-4584-9b30-4c090be02fdc',
    label: 'Projectvereniging',
  },
  DIENSTVERLENENDE_VERENIGING: {
    id: 'd01bb1f6-2439-4e33-9c25-1fc295de2e71',
    label: 'Dienstverlenende vereniging',
  },
  OPDRACHTHOUDENDE_VERENIGING: {
    id: 'cd93f147-3ece-4308-acab-5c5ada3ec63d',
    label: 'Opdrachthoudende vereniging',
  },
  OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME: {
    id: '4b8450cf-a326-4c66-9e63-b4ec10acc7f6',
    label: 'Opdrachthoudende vereniging met private deelname',
  },
  POLICE_ZONE: {
    id: 'a3922c6d-425b-474f-9a02-ffb71a436bfc',
    label: 'Politiezone',
  },
  ASSISTANCE_ZONE: {
    id: 'ea446861-2c51-45fa-afd3-4e4a37b71562',
    label: 'Hulpverleningszone',
  },
  REPRESENTATIVE_ORGAN: {
    // FIXME this is not an administrative unit
    id: '89a00b5a-024f-4630-a722-65a5e68967e5',
    label: 'Representatief orgaan',
  },
  // Currently not used, split in 5 subtypes below
  // OCMW_VERENIGING: {
  //   id: 'cc4e2d67-603b-4784-9b61-e50bac1ec089',
  //   label: 'OCMW vereniging',
  // },
  WELZIJNSVERENIGING: {
    id: 'e8294b73-87c9-4fa2-9441-1937350763c9',
    label: 'Welzijnsvereniging',
  },
  AUTONOME_VERZORGINGSINSTELLING: {
    id: '34b5af85-dc9f-468f-9e03-ef89b174c267',
    label: 'Autonome verzorgingsinstelling',
  },
  // TODO: Non-administrative unit associations: introduced later
  // ZIEKENHUISVERENIGING: {
  //   // FIXME this is not an administrative unit
  //   id: '82250452-83a0-48f4-89cc-b430320493ce',
  //   label: 'Ziekenhuisvereniging',
  // },
  // VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING: {
  //   // FIXME this is not an administrative unit
  //   id: '35833ba2-7371-400b-8df2-2912f66fb153',
  //   label: 'Vereniging of vennootschap voor sociale dienstverlening',
  // },
  // WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP: {
  //   // FIXME this is not an administrative unit
  //   id: '82fd21dc-e8bb-4d13-a010-f4a12358ef10',
  //   label: 'Woonzorgvereniging of woonzorgvennootschap',
  // },
};

export const CLASSIFICATION_CODE = {
  MUNICIPALITY: CLASSIFICATION.MUNICIPALITY.id,
  PROVINCE: CLASSIFICATION.PROVINCE.id,
  OCMW: CLASSIFICATION.OCMW.id,
  DISTRICT: CLASSIFICATION.DISTRICT.id,
  WORSHIP_SERVICE: CLASSIFICATION.WORSHIP_SERVICE.id,
  CENTRAL_WORSHIP_SERVICE: CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
  AGB: CLASSIFICATION.AGB.id,
  APB: CLASSIFICATION.APB.id,
  PROJECTVERENIGING: CLASSIFICATION.PROJECTVERENIGING.id,
  DIENSTVERLENENDE_VERENIGING: CLASSIFICATION.DIENSTVERLENENDE_VERENIGING.id,
  OPDRACHTHOUDENDE_VERENIGING: CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING.id,
  OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME:
    CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME.id,
  POLICE_ZONE: CLASSIFICATION.POLICE_ZONE.id,
  ASSISTANCE_ZONE: CLASSIFICATION.ASSISTANCE_ZONE.id,
  REPRESENTATIVE_ORGAN: CLASSIFICATION.REPRESENTATIVE_ORGAN.id, // FIXME: this is not an administrative unit
  // OCMW_VERENIGING: 'cc4e2d67-603b-4784-9b61-e50bac1ec089', // Currently not used, split in 5 subtypes below
  WELZIJNSVERENIGING: 'e8294b73-87c9-4fa2-9441-1937350763c9',
  AUTONOME_VERZORGINGSINSTELLING: '34b5af85-dc9f-468f-9e03-ef89b174c267',
  // TODO: Non-administrative unit associations: introduced later
  // ZIEKENHUISVERENIGING: '82250452-83a0-48f4-89cc-b430320493ce', // FIXME this is not an administrative unit
  // VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING:
  //   '35833ba2-7371-400b-8df2-2912f66fb153', // FIXME this is not an administrative unit
  // WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP:
  //   '82fd21dc-e8bb-4d13-a010-f4a12358ef10', // FIXME this is not an administrative unit
};

export const OCMW_ASSOCIATION_CLASSIFICATION_CODES = [
  CLASSIFICATION_CODE.WELZIJNSVERENIGING,
  CLASSIFICATION_CODE.AUTONOME_VERZORGINGSINSTELLING,
  // TODO: uncomment when onboarding private OCMW associations
  // CLASSIFICATION_CODE.ZIEKENHUISVERENIGING,
  // CLASSIFICATION_CODE.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING,
  // CLASSIFICATION_CODE.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP,
];

// FIXME: generalize and rename this file
export function isNonAdministrativeUnit(id) {
  return id === CLASSIFICATION_CODE.REPRESENTATIVE_ORGAN;
}

export default class AdministrativeUnitClassificationCodeModel extends OrganizationClassificationCodeModel {
  @attr label;

  get isAgbOrApb() {
    return (
      this.id === CLASSIFICATION_CODE.AGB || this.id === CLASSIFICATION_CODE.APB
    );
  }

  get isIgs() {
    return (
      this.id === CLASSIFICATION_CODE.PROJECTVERENIGING ||
      this.id === CLASSIFICATION_CODE.DIENSTVERLENENDE_VERENIGING ||
      this.id === CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING ||
      this.id ===
        CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME
    );
  }

  get isOcmwAssociation() {
    return OCMW_ASSOCIATION_CLASSIFICATION_CODES.includes(this.id);
  }
}
