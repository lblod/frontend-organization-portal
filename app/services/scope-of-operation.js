import Service, { service } from '@ember/service';

export default class ScopeOfOperationService extends Service {
  @service store;

  getScopeServiceEndpoint(path, location) {
    const locationArg = location ? `/${location.id}` : '';
    return `/scope-of-operation/${path}${locationArg}`;
  }

  /**
   * Retrieve the label to be displayed for the provided organization's scope of
   * of operation. Only administrative units can have a scope of operation
   * defined.
   * @param {Organization} organization - The organization for which to retrieve
   *     the label.
   * @returns {Promise<string | null>} The appropriate label that should be
   *     displayed for the organization's scope
   */
  async getScopeLabel(organization) {
    const scope = await organization.scope;

    let label;
    if (organization.isAdministrativeUnit && scope) {
      const resp = await fetch(
        this.getScopeServiceEndpoint('label-for-scope', scope),
      );

      if (resp.status === 200) {
        label = await resp.json();
      }
    }

    return label;
  }

  /**
   * Retrieve the location resources that are contained within the scope of
   * operation of the provided organization. The location resources contained
   * will be of the smallest level used, typically locations of municipality
   * level.
   * @param {Organization} organization - The organization for which the
   *     retrieve its locations.
   * @returns {Promise<Location[]>} An array containing the locations that are
   *     within the provided organization's scope of operation.
   */
  async getLocationsInScope(organization) {
    const scope = await organization.scope;

    let locations;
    if (organization.isAdministrativeUnit && scope) {
      const resp = await fetch(
        this.getScopeServiceEndpoint('locations-in-scope', scope),
      );

      if (resp.status === 200) {
        const jsonResponse = await resp.json();
        locations = await this.store.query('location', {
          filter: {
            ':id:': jsonResponse.join(','),
          },
          sort: 'label',
        });
      }
    }
    return locations;
  }

  /**
   * Retrieve the location resource that exactly contains the provided
   * locations. This location can be assigned to an organisation as its scope of
   * operation.
   * @param {...Location} locations - The locations that should be contained.
   * @returns {Promise<Location | null>} - The location that exactly matches the
   *     provided ones, null if no locations were provided.
   */
  async getScopeForLocations(...locations) {
    if (locations.length === 0) {
      return null;
    }

    const requestBody = {
      data: {
        locations: locations.map((location) => location.id),
      },
    };

    const scopeUuid = await fetch(
      this.getScopeServiceEndpoint('scope-for-locations'),
      {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
        },
        body: JSON.stringify(requestBody),
      },
    );

    const uuid = await scopeUuid.json();
    const scopeResource = await this.store.findRecord('location', uuid);

    return scopeResource;
  }
}
