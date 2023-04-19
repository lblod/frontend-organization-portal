import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default class SiteTypeSelectComponent extends Component {
  @service store;
  siteTypes;

  constructor(...args) {
    super(...args);

    this.siteTypes = this.loadSiteTypesTask.perform();
  }

  get isWorshipAdministrativeUnit() {
    return this.isWorshipService || this.isCentralWorshipService;
  }

  get isWorshipService() {
    return (
      this.args.administrativeUnitClassification.get('id') ===
      CLASSIFICATION_CODE.WORSHIP_SERVICE
    );
  }

  get isCentralWorshipService() {
    return (
      this.args.administrativeUnitClassification.get('id') ===
      CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE
    );
  }

  get isMunicipality() {
    return (
      this.args.administrativeUnitClassification.get('id') ===
      CLASSIFICATION_CODE.MUNICIPALITY
    );
  }

  get isProvince() {
    return (
      this.args.administrativeUnitClassification.get('id') ===
      CLASSIFICATION_CODE.PROVINCE
    );
  }

  get isDistrict() {
    return (
      this.args.administrativeUnitClassification.get('id') ===
      CLASSIFICATION_CODE.DISTRICT
    );
  }

  get isAgb() {
    return (
      this.args.administrativeUnitClassification.get('id') ===
      CLASSIFICATION_CODE.AGB
    );
  }

  get isApb() {
    return (
      this.args.administrativeUnitClassification.get('id') ===
      CLASSIFICATION_CODE.APB
    );
  }

  @task
  *loadSiteTypesTask() {
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
        allTypes.find((type) => type.id == 'fbec5e94aba343b0a7361aca8a0c7d79') // Ander administratief adres
      );
    } else if (this.isAgb || this.isApb) {
      filteredTypes.push(
        allTypes.find(
          (type) => type.id == 'dcc01338-842c-4fbd-ba68-3ca6f3af975c'
        ) // CorrespondentieAddres
      );
    } else if (this.isProvince) {
      filteredTypes.push(
        allTypes.find((type) => type.id == '15f2683c61b74541b27b64b4365806c7') // Provinciehuis
      );
    } else if (this.isDistrict) {
      filteredTypes.push(
        allTypes.find((type) => type.id == 'db13a289b78e42d19d8d1d269b61b18f') // Districtshuis
      );
    }

    return filteredTypes;
  }
}
