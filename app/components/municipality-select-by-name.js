import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { trackedTask } from 'ember-resources/util/ember-concurrency';

export default class MunicipalitySelectByNameComponent extends Component {
  @service store;

  municipalities = trackedTask(this, this.loadMunicipalitiesTask, () => [
    this.args.selectedProvince,
  ]);

  @task
  *loadMunicipalitiesTask() {
    // Trick used to avoid infinite loop
    // See https://github.com/NullVoxPopuli/ember-resources/issues/340 for more details
    yield Promise.resolve();

    let municipalities = [];

    if (this.args.selectedProvince && this.args.selectedProvince.length) {
      // If we removed the selected municipality, we don't want it to be auto-selected again by
      // default to avoid ending up in a loop where we can never delete the province
      if (
        !this.selected &&
        this.previousProvince &&
        this.args.selectedProvince === this.previousProvince
      ) {
        return [this.previousMunicipality.name];
      }

      // If a province is selected, load the municipalities in it
      municipalities = yield this.store.query('organization', {
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

      municipalities = yield this.store.query('organization', query);
    }

    // Auto-selects the municipality when there is only once choice
    if (!this.args.selected && municipalities.slice().length === 1) {
      this.previousProvince = this.args.selectedProvince;
      this.previousMunicipality = municipalities.slice()[0];
      this.args.onChange(this.previousMunicipality.name);
    } else {
      this.previousProvince = null;
      this.previousMunicipality = null;
    }

    return municipalities.map(({ name }) => name);
  }
}
