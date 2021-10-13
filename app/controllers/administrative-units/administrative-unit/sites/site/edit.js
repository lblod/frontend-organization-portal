import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { combineFullAddress } from 'frontend-contact-hub/models/address';

export default class AdministrativeUnitsAdministrativeUnitSitesSiteEditController extends Controller {
  @service router;
  @tracked isPrimarySite;

  get isCurrentPrimarySite() {
    return this.model.site.id === this.model.currentPrimarySite?.id;
  }

  setup() {
    this.isPrimarySite = this.isCurrentPrimarySite;
  }

  reset() {
    this.removeUnsavedRecords();
  }

  @dropTask
  *save(event) {
    event.preventDefault();

    let { address, administrativeUnit, contact, site } = this.model;

    yield address.validate();
    yield contact.validate();

    if (address.isValid && contact.isValid) {
      if (address.isDirty) {
        address.fullAddress = combineFullAddress(address);
        yield address.save();
      }

      if (contact.isDirty) {
        yield contact.save();
      }

      yield site.save();

      let nonPrimarySites = yield administrativeUnit.sites;

      if (this.isCurrentPrimarySite && !this.isPrimarySite) {
        nonPrimarySites.pushObject(site);
        administrativeUnit.primarySite = null;

        yield administrativeUnit.save();
      } else if (this.isPrimarySite && !this.isCurrentPrimarySite) {
        let previousPrimarySite = this.model.currentPrimarySite;

        if (previousPrimarySite) {
          nonPrimarySites.addObject(previousPrimarySite);
        }

        administrativeUnit.primarySite = site;
        nonPrimarySites.removeObject(site);

        yield administrativeUnit.save();
      }

      this.router.transitionTo(
        'administrative-units.administrative-unit.sites.site',
        site.id
      );
    }
  }

  removeUnsavedRecords() {
    if (this.model.contact.isNew) {
      this.model.contact.destroyRecord();
    }
  }
}
