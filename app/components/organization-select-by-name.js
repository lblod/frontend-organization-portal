import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
import {
  selectByRole as getClassificationIds,
  getClassificationIdsForRole,
} from 'frontend-organization-portal/utils/classification-identifiers';

export default class OrganizationSelectByNameComponent extends Component {
  @service muSearch;
  @service currentSession;

  @restartableTask
  *loadOrganizationsTask(searchParams = '') {
    const filter = {};

    if (searchParams.trim() !== '') {
      filter[`:phrase_prefix:legal_name,alternative_name,name`] = searchParams;
    }

    // Determine classification codes based on user selection, if any
    let queryClassifications = [];
    if (
      this.args.selectedClassificationIds &&
      this.args.selectedOrganizationTypes
    ) {
      const idsFromOrganizationType = getClassificationIdsForRole(
        this.currentSession.hasWorshipRole,
        false,
        ...this.args.selectedOrganizationTypes.split(','),
      );

      const idsFromClassifications =
        this.args.selectedClassificationIds.split(',');

      queryClassifications = idsFromOrganizationType
        .filter((id) => idsFromClassifications.includes(id))
        .map((id) => `(classification_id:${id})`)
        .join(' OR ');
    } else if (this.args.selectedOrganizationTypes) {
      queryClassifications = getClassificationIdsForRole(
        this.currentSession.hasWorshipRole,
        false,
        ...this.args.selectedOrganizationTypes.split(','),
      ).join(' OR ');
    } else if (this.args.selectedClassificationIds) {
      queryClassifications = this.args.selectedClassificationIds
        .split(',')
        .map((id) => `(classification_id:${id})`)
        .join(' OR ');
    } else {
      queryClassifications = getClassificationIds(
        this.currentSession.hasWorshipRole,
      );
    }
    filter[':query:classification_id'] = queryClassifications;

    if (this.args.selectedMunicipality) {
      filter[':phrase:municipality'] = this.args.selectedMunicipality;
    }

    if (this.args.selectedProvince) {
      filter[':phrase:province'] = this.args.selectedProvince;
    }

    if (this.args.selectedRecognizedWorshipTypeId) {
      filter['recognized_worship_type_id'] =
        this.args.selectedRecognizedWorshipTypeId;
    }

    if (this.args.selectedOrganizationStatus) {
      filter['status_id'] = this.args.selectedOrganizationStatus;
    }

    if (this.args.selectedIdentifier) {
      filter[':prefix:identifier.index'] = this.args.selectedIdentifier;
    }

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
