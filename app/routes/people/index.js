import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { keepLatestTask } from 'ember-concurrency';

export default class PeopleIndexRoute extends Route {
  @service store;
  @service muSearch;

  queryParams = {
    page: { refreshModel: true },
    sort: { refreshModel: true },
    status: { refreshModel: true, replace: true },
    position: { refreshModel: true, replace: true },
    organization: { refreshModel: true, replace: true },
    given_name: { refreshModel: true, replace: true },
    family_name: { refreshModel: true, replace: true },
  };

  model(params) {
    return {
      loadPeopleTaskInstance: this.loadPeopleTask.perform(params),
      loadedPeople: this.loadPeopleTask.lastSuccessful?.value,
    };
  }

  @keepLatestTask({ cancelOn: 'deactivate' })
  *loadPeopleTask(params) {
    const filter = {};
    if (params.given_name) {
      filter[':phrase_prefix:given_name'] = `${params.given_name.trim()}`;
    }
    if (params.family_name) {
      filter[':phrase_prefix:family_name'] = `${params.family_name.trim()}`;
    }
    if (params.status) {
      let date = new Date().toISOString().slice(0, -5);
      filter[
        ':query:end_date'
      ] = `(NOT (_exists_:end_date))  OR (end_date:[${date} TO *] ) `;
    }
    if (params.position) {
      filter['position_id'] = params.position;
    }
    if (params.organization) {
      filter['organization_id'] = params.organization;
    }

    const page = yield this.muSearch.search({
      index: 'people',
      filters: filter,
      sort: params.sort,
      page: params.page,
      size: params.size,
      dataMapping: (data) => {
        const entry = data.attributes;
        entry.end_date = entry.end_date ? new Date(entry.end_date) : null;
        // we changed the logic of indexing id & uuid in mu-search config, so we remap it here
        entry.id = entry.person_id;
        entry.uuid = Array.isArray(entry.uuid) ? entry.uuid[0] : entry.uuid;
        return entry;
      },
    });

    for (const person of page.toArray()) {
      // TODO
      // another option would be to reindex everything & keeping the type instead
      // but this seems too much just to allow opening the link in a new tab...
      // if it is a better option (reindex), we can do it as well

      if (person.uri.includes('/rollenBedienaar/')) {
        person.positionRoute = 'people.person.positions.minister';
      } else if (person.uri.includes('/mandatarissen/')) {
        person.positionRoute = 'people.person.positions.mandatory';
      } else if (person.uri.includes('/functionarissen/')) {
        person.positionRoute = 'people.person.positions.agent';
      }

      // In the case of functionarissen, a bestuursfunctie is linked to multiple units (OCMW and Gemeente)
      person.organizations = [];
      if (Array.isArray(person.organization_id)) {
        for (let [index, id] of person.organization_id.entries()) {
          const displayLinkToOrgaan = !this.isClassificationAgbOrApbOrIgs(
            person.organization_classification[index]
          );
          person.organizations.push({
            id,
            classification: person.organization_classification[index],
            displayLinkToOrgaan,
          });
        }
      } else {
        const displayLinkToOrgaan = !this.isClassificationAgbOrApbOrIgs(
          person.organization_classification
        );
        person.organizations = [
          {
            id: person.organization_id,
            classification: person.organization_classification,
            displayLinkToOrgaan,
          },
        ];
      }
    }
    return page;
  }

  isClassificationAgbOrApbOrIgs(classification) {
    return (
      classification === 'Autonoom gemeentebedrijf' ||
      classification === 'Autonoom provinciebedrijf' ||
      classification === 'Projectvereniging' ||
      classification === 'Dienstverlenende vereniging' ||
      classification === 'Opdrachthoudende vereniging' ||
      classification === 'Opdrachthoudende vereniging met private deelname'
    );
  }
}
