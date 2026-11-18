import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { query as queryBuilder } from '@warp-drive/legacy/compat/builders';
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

    let provinceNames = [];
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

      // If a municipality is selected, load the province location it lies in:
      // locations are readable for every role, labeled with the province name.
      const { content: provinces } = await this.store.request(
        queryBuilder('location', {
          filter: {
            ':exact:level': 'Provincie',
            locations: {
              ':exact:label': this.args.selectedMunicipality,
            },
          },
        }),
      );
      provinceNames = provinces.map(({ label }) => label);
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
      const { content: provinces } = await this.store.request(
        queryBuilder('organization', query),
      );
      provinceNames = provinces.map(({ name }) => name);
    }

    if (provinceNames.length === 1) {
      this.previousMunicipality = this.args.selectedMunicipality;
      this.previousProvince = provinceNames[0];
      this.args.onChange(this.previousProvince);
    } else {
      this.previousMunicipality = null;
      this.previousProvince = null;
    }
    return provinceNames;
  });

  provinces = trackedTask(this, this.loadProvincesTask, () => [
    this.args.selectedMunicipality,
  ]);
}
