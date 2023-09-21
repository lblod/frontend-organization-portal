import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
import { selectByRole as getClassificationIds } from 'frontend-organization-portal/utils/classification-identifiers';
import { formatIdentifier } from 'frontend-organization-portal/helpers/format-identifier';

export default class AdministrativeUnitSelectByIdentifierComponent extends Component {
  @service muSearch;
  @service currentSession;

  @restartableTask
  *loadAdministrativeUnitsTask(searchParams = '') {
    const filter = {};

    searchParams = formatIdentifier([searchParams]);

    if (searchParams.trim() !== '') {
      // Note: toLowerCase is needed to properly match OVO numbers
      filter[`:prefix:identifier`] = searchParams.toLowerCase();
    }

    filter['classification_id'] = getClassificationIds(
      this.currentSession.hasWorshipRole
    );

    const result = yield this.muSearch.search({
      index: 'units',
      sort: 'name',
      page: '0',
      size: '100',
      filters: filter,
      dataMapping: (data) => {
        const entry = data.attributes.identifier;

        // Note: Dev contains data for which the resulting identifiers is not
        // an array, might need be needed in cleaned up data
        if (Array.isArray(entry)) {
          return entry.filter((id) =>
            id.toLowerCase().startsWith(searchParams.toLowerCase())
          );
        } else {
          return entry;
        }
      },
    });

    if (result) {
      return [...[searchParams], ...new Set(result.toArray())];
    }
  }
}
