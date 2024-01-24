import Controller from '@ember/controller';

export default class AdministrativeUnitsAdministrativeUnitSitesSiteIndexController extends Controller {
  get isAndereVestigen() {
    return (
      this.model.site.siteType &&
      this.model.site.siteType.get('id') ===
        'dcc01338-842c-4fbd-ba68-3ca6f3af975c'
    );
  }
}
