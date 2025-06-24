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

    // If we removed the selected municipality, we don't want it to be auto-selected again by
    // default to avoid ending up in a loop where we can never delete the province
    if (
      !this.selected &&
      this.previousProvince &&
      this.args.selectedProvince === this.previousProvince
    ) {
      return [this.previousMunicipality];
    }

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
      include: 'organization-status',
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

    const municipalities = yield this.store.query('organization', query);

    // Auto-selects the municipality when there is only once choice
    if (!this.args.selected && municipalities.slice().length === 1) {
      this.previousProvince = this.args.selectedProvince;
      this.previousMunicipality = municipalities.slice()[0];
    } else {
      this.previousProvince = null;
      this.previousMunicipality = null;
    }

    return municipalities;
  }
}
