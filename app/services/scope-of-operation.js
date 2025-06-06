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
}
