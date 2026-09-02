import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { trackedTask } from 'reactiveweb/ember-concurrency';

export default class MunicipalitySelectByNameComponent extends Component {
  @service store;

  loadMunicipalitiesTask = task(async () => {
    // Trick used to avoid infinite loop
    // See https://github.com/NullVoxPopuli/ember-resources/issues/340 for more details
    await Promise.resolve();

    if (this.args.selectedProvince && this.args.selectedProvince.length) {
      // If a province is selected, load the municipalities in it
      let municipalities = await this.store.query('organization', {
        filter: {
          'memberships-of-organizations': {
            organization: {
              ':exact:name': this.args.selectedProvince,
            },
          },
          classification: {
            id: CLASSIFICATION.MUNICIPALITY.id,
          },
        },
        sort: 'name',
        page: {
          size: 400,
        },
      });

      return municipalities.map(({ name }) => name);
    } else {
      // Else load all the municipalities
      const query = {
        filter: {
          classification: {
            id: CLASSIFICATION.MUNICIPALITY.id,
          },
        },
        sort: 'name',
        page: {
          size: 400,
        },
      };

      const municipalities = await this.store.query('organization', query);

      return municipalities.map(({ name }) => name);
    }
  });

  municipalities = trackedTask(this, this.loadMunicipalitiesTask, () => [
    this.args.selectedProvince,
  ]);
}
