import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { trackedTask } from 'reactiveweb/ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class ProvinceSelectComponent extends Component {
  @service store;

  @tracked previousMunicipality;
  @tracked previousProvince;

  loadProvincesTask = task(async () => {
    // Trick used to avoid infinite loop
    // See https://github.com/NullVoxPopuli/ember-resources/issues/340 for more details
    await Promise.resolve();

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
      provinces = await this.store.query('organization', {
        filter: {
          memberships: {
            member: {
              ':exact:name': this.args.selectedMunicipality,
            },
          },
          classification: {
            id: CLASSIFICATION.PROVINCE.id,
          },
        },
      });
    } else {
      // Else load all the provinces
      const query = {
        filter: {
          classification: {
            id: CLASSIFICATION.PROVINCE.id,
          },
        },
        sort: 'name',
      };
      provinces = await this.store.query('organization', query);
    }

    if (provinces.slice().length === 1) {
      this.previousMunicipality = this.args.selectedMunicipality;
      this.previousProvince = provinces.map(({ name }) => name).slice()[0];
      this.args.onChange(this.previousProvince);
    } else {
      this.previousMunicipality = null;
      this.previousProvince = null;
    }
    return provinces.map(({ name }) => name);
  });

  provinces = trackedTask(this, this.loadProvincesTask, () => [
    this.args.selectedMunicipality,
  ]);
}
