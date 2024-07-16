import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { trackedTask } from 'ember-resources/util/ember-concurrency';

export default class MunicipalitySelectComponent extends Component {
  @service store;

  municipalities = trackedTask(this, this.loadMunicipalitiesTask, () => [
    this.args.selectedProvince,
  ]);

  @task
  *loadMunicipalitiesTask() {
    // Trick used to avoid infinite loop
    // See https://github.com/NullVoxPopuli/ember-resources/issues/340 for more details
    yield Promise.resolve();

    const selectedProvinceId = this.args.selectedProvince?.get('id');

    if (selectedProvinceId && selectedProvinceId.length) {
      // If a province is selected, load the municipalities in it
      let municipalities = yield this.store.query('organization', {
        filter: {
          'memberships-of-organizations': {
            organization: {
              id: selectedProvinceId,
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

      return municipalities;
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

      return yield this.store.query('organization', query);
    }
  }
}
