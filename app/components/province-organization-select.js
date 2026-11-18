import Component from '@glimmer/component';
import { service } from '@ember/service';
import { query as queryBuilder } from '@warp-drive/legacy/compat/builders';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { task } from 'ember-concurrency';
import { trackedTask } from 'reactiveweb/ember-concurrency';

export default class ProvinceOrganizationSelectComponent extends Component {
  @service store;

  loadProvincesTask = task(async () => {
    // Trick used to avoid infinite loop
    // See https://github.com/NullVoxPopuli/ember-resources/issues/340 for more details
    await Promise.resolve();

    const { content: provinces } = await this.store.request(
      queryBuilder('organization', {
        filter: {
          classification: {
            id: CLASSIFICATION.PROVINCE.id,
          },
        },
        sort: 'name',
      }),
    );

    return provinces;
  });

  provinces = trackedTask(this, this.loadProvincesTask);
}
