import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { combineFullAddress } from 'frontend-organization-portal/models/address';

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

    let { address, administrativeUnit, contact, secondaryContact, site } =
      this.model;

    yield address.validate();
    yield contact.validate();
    yield secondaryContact.validate();

    if (address.isValid && contact.isValid && secondaryContact.isValid) {
      if (address.isDirty) {
        address.fullAddress = combineFullAddress(address);
        if (address.boxNumber === '') {
          address.boxNumber = null;
        }
        yield address.save();
      }

      if (contact.isDirty) {
        if (contact.isNew) {
          site.contacts.pushObject(contact);
        }

        if (contact.telephone === '') {
          contact.telephone = null;
        }
        if (contact.website === '') {
          contact.website = null;
        }
        yield contact.save();
      }

      if (secondaryContact.isDirty) {
        if (secondaryContact.isNew) {
          site.contacts.pushObject(secondaryContact);
        }
        if (secondaryContact.telephone === '') {
          secondaryContact.telephone = null;
        }
        yield secondaryContact.save();
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
    let { contact, secondaryContact } = this.model;
    if (contact.isNew) {
      contact.destroyRecord();
    }

    if (secondaryContact.isNew) {
      secondaryContact.destroyRecord();
    }
  }
}
