import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { query as queryBuilder } from '@warp-drive/legacy/compat/builders';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { trackedTask } from 'reactiveweb/ember-concurrency';

export default class MunicipalitySelectByNameComponent extends Component {
  @service store;

  loadMunicipalitiesTask = task(async () => {
    // Trick used to avoid infinite loop
    // See https://github.com/NullVoxPopuli/ember-resources/issues/340 for more details
    await Promise.resolve();

    if (this.args.selectedProvince && this.args.selectedProvince.length) {
      // If a province is selected, load its municipality locations: these are
      // readable for every role and their labels are the municipality names.
      const { content: municipalities } = await this.store.request(
        queryBuilder('location', {
          filter: {
            ':exact:level': 'Gemeente',
            'located-within': {
              ':exact:label': this.args.selectedProvince,
            },
          },
          sort: 'label',
          page: {
            size: 400,
          },
        }),
      );

      return municipalities.map(({ label }) => label);
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

      const { content: municipalities } = await this.store.request(
        queryBuilder('organization', query),
      );

      return municipalities.map(({ name }) => name);
    }
  });

  municipalities = trackedTask(this, this.loadMunicipalitiesTask, () => [
    this.args.selectedProvince,
  ]);
}
