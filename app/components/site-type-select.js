import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class SiteTypeSelectComponent extends Component {
  @service fastboot;
  @service store;
  siteTypes;

  constructor(...args) {
    super(...args);

    if (!this.fastboot.isFastBoot) {
      this.siteTypes = this.loadSiteTypesTask.perform();
    }
  }

  @task
  *loadSiteTypesTask() {
    return yield this.store.findAll('site-type', { reload: true });
  }
}
