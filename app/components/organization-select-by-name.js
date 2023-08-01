import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';

import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';
export default class OrganizationSelectByNameComponent extends Component {
  @service muSearch;
  @service currentSession;

  @restartableTask
  *loadOrganizationsTask(searchParams = '') {
    const filter = {};

    if (searchParams.trim() !== '') {
      filter[`:phrase_prefix:name`] = searchParams;
    }
    if (this.currentSession.hasWorshipRole) {
      filter['classification_id'] = `
        ${CLASSIFICATION.REPRESENTATIVE_ORGAN.id},

        `;
    } else {
      filter['classification_id'] = `
       `;
    }

    const result = yield this.muSearch.search({
      index: 'registered-orgs',
      sort: 'name',
      page: '0',
      size: '100',
      filters: filter,
      dataMapping: (data) => {
        const entry = data.attributes;
        return entry.name;
      },
    });

    if (result) {
      return [...[searchParams], ...new Set(result.toArray())];
    }
  }
}
