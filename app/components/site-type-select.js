import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';

// TODO: remove administrative unit classifications after edit functionality
// moved to CLB
export default class SiteTypeSelectComponent extends Component {
  @service store;
  siteTypes;

  constructor(...args) {
    super(...args);

    this.siteTypes = this.loadSiteTypesTask.perform();
  }

  @task
  *loadSiteTypesTask() {
    yield timeout(500);

    let allTypes = yield this.store.findAll('site-type', { reload: true });
    let filteredTypes = [];

    filteredTypes.push(
      allTypes.find((type) => type.id == 'f1381723dec42c0b6ba6492e41d6f5dd') // Maatschappelijke zetel
    );

    if (this.args.organization.isWorshipAdministrativeUnit) {
      filteredTypes.push(
        allTypes.find((type) => type.id == 'dd0418307e7038c0c3809e3ec03a0932') // Hoofdgebouw erediensten
      );
    } else if (this.args.organization.isMunicipality) {
      filteredTypes.push(
        allTypes.find((type) => type.id == '57e8e5498ca84056b8a87631a26c90af') // Gemeentehuis
      );
      filteredTypes.push(
        allTypes.find(
          (type) => type.id == 'dcc01338-842c-4fbd-ba68-3ca6f3af975c'
        ) // Andere vestiging
      );
    } else if (
      this.args.organization.isAgb ||
      this.args.organization.isApb ||
      this.args.organization.isIGS ||
      this.args.organization.isOcmwAssociation ||
      this.args.organization.isPevaMunicipality ||
      this.args.organization.isPevaProvince ||
      this.args.organization.isAssociationOther ||
      this.args.organization.isCorporationOther
    ) {
      filteredTypes.push(
        allTypes.find(
          (type) => type.id == 'dcc01338-842c-4fbd-ba68-3ca6f3af975c'
        ) // Andere vestiging
      );
    } else if (this.args.organization.isProvince) {
      filteredTypes.push(
        allTypes.find((type) => type.id == '15f2683c61b74541b27b64b4365806c7') // Provinciehuis
      );
    } else if (this.args.organization.isDistrict) {
      filteredTypes.push(
        allTypes.find((type) => type.id == 'db13a289b78e42d19d8d1d269b61b18f') // Districtshuis
      );
    } else if (this.args.organization.isPoliceZone) {
      filteredTypes.push(
        allTypes.find(
          (type) => type.id == '0ed15289-1f3d-4172-8c46-0506de5aa2a3'
        ) // Hoofdcommissariaat
      );
    }

    return filteredTypes;
  }
}
