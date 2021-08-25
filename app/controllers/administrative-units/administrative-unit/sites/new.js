import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { combineFullAddress } from 'frontend-contact-hub/models/address';

export default class AdministrativeUnitsAdministrativeUnitSitesNewController extends Controller {
  @service router;
  @service store;

  @dropTask
  *createSiteTask(event) {
    event.preventDefault();

    if (
      !(
        this.isPrimarySite &&
        this.model.administrativeUnit.primarySite.get('id')
      )
    ) {
      let { site, address, contact } = this.model;

      yield contact.save();

      address.fullAddress = combineFullAddress(address);
      yield address.save();

      site.address = address;
      site.contacts.pushObjects([contact]);
      yield site.save();

      if (this.isPrimarySite) {
        this.model.administrativeUnit.primarySite = site;
      } else {
        this.model.administrativeUnit.sites.pushObject(site);
      }

      yield this.model.administrativeUnit.save();

      this.router.replaceWith(
        'administrative-units.administrative-unit.sites.site',
        site.id
      );
    }
  }

  reset() {
    this.removeUnsavedRecords();
  }

  removeUnsavedRecords() {
    this.model.site.rollbackAttributes();
    this.model.address.rollbackAttributes();
    this.model.contact.rollbackAttributes();
  }
}
