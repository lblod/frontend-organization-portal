import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { OcmwAssociationCodeList } from '../constants/Classification';

export default class SiteTypeSelectComponent extends Component {
  @service store;
  siteTypes;

  constructor(...args) {
    super(...args);

    this.siteTypes = this.loadSiteTypesTask.perform();
  }

  // TODO: the site edit functionality moves to CLB app, afterwards this code
  // should be removed as it is no longer needed in OP
  get isWorshipAdministrativeUnit() {
    return this.isWorshipService || this.isCentralWorshipService;
  }

  get isWorshipService() {
    return (
      this.args.organizationClassification.get('id') ===
      CLASSIFICATION.WORSHIP_SERVICE.id
    );
  }

  get isCentralWorshipService() {
    return (
      this.args.organizationClassification.get('id') ===
      CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id
    );
  }

  get isMunicipality() {
    return (
      this.args.organizationClassification.get('id') ===
      CLASSIFICATION.MUNICIPALITY.id
    );
  }

  get isProvince() {
    return (
      this.args.organizationClassification.get('id') ===
      CLASSIFICATION.PROVINCE.id
    );
  }

  get isDistrict() {
    return (
      this.args.organizationClassification.get('id') ===
      CLASSIFICATION.DISTRICT.id
    );
  }

  get isAgb() {
    return (
      this.args.organizationClassification.get('id') === CLASSIFICATION.AGB.id
    );
  }

  get isIGS() {
    const typesThatAreIGS = [
      CLASSIFICATION.PROJECTVERENIGING.id,
      CLASSIFICATION.DIENSTVERLENENDE_VERENIGING.id,
      CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING.id,
      CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME.id,
    ];
    return typesThatAreIGS.includes(
      this.args.organizationClassification.get('id')
    );
  }

  get isApb() {
    return (
      this.args.organizationClassification.get('id') === CLASSIFICATION.APB.id
    );
  }

  get isPoliceZone() {
    return (
      this.args.organizationClassification.get('id') ===
      CLASSIFICATION.POLICE_ZONE.id
    );
  }

  get isOcmwAssociation() {
    return OcmwAssociationCodeList.includes(
      this.args.organizationClassification.get('id')
    );
  }

  get isPevaMunicipality() {
    return (
      this.args.organizationClassification.get('id') ===
      CLASSIFICATION.PEVA_MUNICIPALITY.id
    );
  }

  get isPevaProvince() {
    return (
      this.args.organizationClassification.get('id') ===
      CLASSIFICATION.PEVA_PROVINCE.id
    );
  }

  @task
  *loadSiteTypesTask() {
    yield timeout(500);

    let allTypes = yield this.store.findAll('site-type', { reload: true });
    let filteredTypes = [];

    filteredTypes.push(
      allTypes.find((type) => type.id == 'f1381723dec42c0b6ba6492e41d6f5dd') // Maatschappelijke zetel
    );

    if (this.isWorshipAdministrativeUnit) {
      filteredTypes.push(
        allTypes.find((type) => type.id == 'dd0418307e7038c0c3809e3ec03a0932') // Hoofdgebouw erediensten
      );
    } else if (this.isMunicipality) {
      filteredTypes.push(
        allTypes.find((type) => type.id == '57e8e5498ca84056b8a87631a26c90af') // Gemeentehuis
      );
      filteredTypes.push(
        allTypes.find(
          (type) => type.id == 'dcc01338-842c-4fbd-ba68-3ca6f3af975c'
        ) // Andere vestiging
      );
    } else if (
      this.isAgb ||
      this.isApb ||
      this.isIGS ||
      this.isOcmwAssociation ||
      this.isPevaMunicipality ||
      this.isPevaProvince
    ) {
      filteredTypes.push(
        allTypes.find(
          (type) => type.id == 'dcc01338-842c-4fbd-ba68-3ca6f3af975c'
        ) // Andere vestiging
      );
    } else if (this.isProvince) {
      filteredTypes.push(
        allTypes.find((type) => type.id == '15f2683c61b74541b27b64b4365806c7') // Provinciehuis
      );
    } else if (this.isDistrict) {
      filteredTypes.push(
        allTypes.find((type) => type.id == 'db13a289b78e42d19d8d1d269b61b18f') // Districtshuis
      );
    } else if (this.isPoliceZone) {
      filteredTypes.push(
        allTypes.find(
          (type) => type.id == '0ed15289-1f3d-4172-8c46-0506de5aa2a3'
        ) // Hoofdcommissariaat
      );
    }

    return filteredTypes;
  }
}
