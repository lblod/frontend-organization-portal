import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { trackedTask } from 'ember-resources/util/ember-concurrency';
import { ORGANIZATION_STATUS } from '../models/organization-status-code';

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

    let query = {
      filter: {
        classification: {
          id: CLASSIFICATION.MUNICIPALITY.id,
        },
        'organization-status': {
          id: this.args.limitToActiveOrganizations
            ? ORGANIZATION_STATUS.ACTIVE
            : undefined,
        },
      },
      sort: 'name',
      page: {
        size: 400,
      },
    };

    const selectedProvinceId = this.args.selectedProvince?.get('id');
    // If a province is selected, load the municipalities in it
    if (selectedProvinceId && selectedProvinceId.length) {
      query['filter[memberships-of-organizations][organization][:id:]'] =
        selectedProvinceId;
    }

    return yield this.store.query('organization', query);
  }
}
