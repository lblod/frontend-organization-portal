import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { combineFullAddress } from 'frontend-contact-hub/models/address';
import { tracked } from '@glimmer/tracking';
export default class AdministrativeUnitsAdministrativeUnitSitesNewController extends Controller {
  @service router;
  @service store;
  @tracked isPrimarySite;

  @dropTask
  *createSiteTask(event) {
    event.preventDefault();

    let { site, address, contact } = this.model;

    yield address.validate();
    yield contact.validate();

    if (address.isValid && contact.isValid) {
      yield contact.save();

      address.fullAddress = combineFullAddress(address);
      yield address.save();

      site.address = address;
      site.contacts.pushObject(contact);
      yield site.save();

      if (this.isPrimarySite) {
        let currentPrimarySite = yield this.model.administrativeUnit
          .primarySite;
        this.model.administrativeUnit.sites.pushObject(currentPrimarySite);

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
    // @TODO: The new record isn't destroyed like this if it's wrapped in a changeset. Investigate why .destroyRecord() instead doesn't work proprerly.
    this.model.site.rollbackAttributes();
    this.model.address.rollbackAttributes();
    this.model.contact.rollbackAttributes();
  }
}
