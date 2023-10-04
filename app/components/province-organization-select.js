import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { trackedTask } from 'ember-resources/util/ember-concurrency';

export default class ProvinceOrganizationSelectComponent extends Component {
  @service store;
  @tracked previousMunicipality;
  @tracked previousProvince;

  provinces = trackedTask(this, this.loadProvincesTask, () => [
    this.args.selectedMunicipality,
  ]);

  @task
  *loadProvincesTask() {
    console.log(this.selectedMunicipality);
    // Trick used to avoid infinite loop
    // See https://github.com/NullVoxPopuli/ember-resources/issues/340 for more details
    yield Promise.resolve();

    let provinces = [];
    if (
      this.args.selectedMunicipality &&
      this.args.selectedMunicipality.length
    ) {
      if (
        this.previousMunicipality &&
        this.args.selectedMunicipality === this.previousMunicipality
      ) {
        this.args.onChange(this.previousProvince);

        this.provinces.cancel(); //  prevent infinite loop.
        return [this.previousProvince];
      }

      // If a municipality is selected, load the province it belongs to
      provinces = yield this.store.query('administrative-unit', {
        filter: {
          'sub-organizations': {
            ':exact:name': this.args.selectedMunicipality,
          },
          classification: {
            id: CLASSIFICATION_CODE.PROVINCE,
          },
        },
      });
    } else {
      // Else load all the provinces
      provinces = yield this.store.query('administrative-unit', {
        filter: {
          classification: {
            id: CLASSIFICATION_CODE.PROVINCE,
          },
        },
        sort: 'name',
      });
    }
    return provinces;
  }
}
