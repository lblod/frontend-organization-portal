import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
export default class AdministrativeUnitsAdministrativeUnitSitesSiteRoute extends Route {
  @service store;

  async model() {
    let administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit'
    );

    let { siteId: siteId } = this.paramsFor(
      'administrative-units.administrative-unit.sites.site'
    );

    let site = await this.store.findRecord('site', siteId, {
      reload: true,
      include: ['address', 'contacts'].join(),
    });

    return {
      site: site,
      administrativeUnit: administrativeUnit,
    };
  }
}
