import Component from '@glimmer/component';
import { service } from '@ember/service';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { trackedTask } from 'reactiveweb/ember-concurrency';

export default class ProvinceOrganizationSelectComponent extends Component {
  @service store;
  @tracked previousMunicipality;
  @tracked previousProvince;

  loadProvincesTask = task(async () => {
    // Trick used to avoid infinite loop
    // See https://github.com/NullVoxPopuli/ember-resources/issues/340 for more details
    await Promise.resolve();

    let provinces = [];
    const selectedMunicipalityId = this.args.selectedMunicipality?.get('id');

    if (selectedMunicipalityId && selectedMunicipalityId.length) {
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
              id: selectedMunicipalityId,
            },
          },
          classification: {
            id: CLASSIFICATION.PROVINCE.id,
          },
        },
        sort: 'name',
      });
    } else {
      // Else load all the provinces
      provinces = await this.store.query('organization', {
        filter: {
          classification: {
            id: CLASSIFICATION.PROVINCE.id,
          },
        },
        sort: 'name',
      });
    }

    // Auto-selects the province when there is only once choice
    if (!this.args.selected && provinces.slice().length === 1) {
      this.previousMunicipality = this.args.selectedMunicipality;
      this.previousProvince = provinces.slice()[0];
      this.args.onChange(this.previousProvince);
    } else {
      this.previousMunicipality = null;
      this.previousProvince = null;
    }
    return provinces;
  });

  provinces = trackedTask(this, this.loadProvincesTask, () => [
    this.args.selectedMunicipality,
  ]);
}
