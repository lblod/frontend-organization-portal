import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class SiteTypeSelectComponent extends Component {
  @service store;
  siteTypes;

  constructor(...args) {
    super(...args);

    this.siteTypes = this.loadSiteTypesTask.perform();
  }

  @task
  *loadSiteTypesTask() {
    let types = yield this.store.findAll('site-type', { reload: true });

    if (this.args.isWorshipAdministrativeUnit) {
      types = types.filter(
        (type) => type.id != '57e8e5498ca84056b8a87631a26c90af' // Gemeentehuis
      );
    } else {
      types = types.filter(
        (type) => type.id != 'dd0418307e7038c0c3809e3ec03a0932' // Hoofdgebouw erediensten
      );
    }

    return types;
  }
}
