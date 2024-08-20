import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
import { selectByRole as getClassificationIds } from 'frontend-organization-portal/utils/classification-identifiers';

export default class OrganizationSelectByNameComponent extends Component {
  @service muSearch;
  @service currentSession;

  @restartableTask
  *loadOrganizationsTask(searchParams = '') {
    const filter = {};

    if (searchParams.trim() !== '') {
      filter[`:phrase_prefix:legal_name,alternative_name,name`] = searchParams;
    }

    filter['classification_id'] = getClassificationIds(
      this.currentSession.hasWorshipRole,
    );

    const result = yield this.muSearch.search({
      index: 'organizations',
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
      return [...[searchParams], ...new Set(result.slice())];
    }
  }
}
