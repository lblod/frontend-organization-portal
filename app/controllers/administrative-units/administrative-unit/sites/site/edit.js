import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { combineFullAddress } from 'frontend-organization-portal/models/address';
import { setEmptyStringsToNull } from 'frontend-organization-portal/utils/empty-string-to-null';
import { transformPhoneNumbers } from 'frontend-organization-portal/utils/transform-phone-numbers';

export default class AdministrativeUnitsAdministrativeUnitSitesSiteEditController extends Controller {
  @service router;
  @tracked isPrimarySite;
  @tracked isNoPrimarySiteErrorMessage;

  get isCurrentPrimarySite() {
    return this.model.site.id === this.model.currentPrimarySite?.id;
  }

  setup() {
    this.isPrimarySite = this.isCurrentPrimarySite;
  }

  get hasValidationErrors() {
    return (
      this.model.site.error ||
      this.model.address.error ||
      this.model.contact.error ||
      this.model.secondaryContact.error
    );
  }

  @action
  updateIsPrimarySite(isPrimarySite) {
    this.isPrimarySite = isPrimarySite;
    if (
      !this.isPrimarySite &&
      (!this.model.administrativeUnit.primarySite?.get('id') ||
        this.isCurrentPrimarySite)
    ) {
      this.isNoPrimarySiteErrorMessage =
        'Deze vestiging wordt automatisch als primair contactadres aangeduid omdat er nog geen primair contactadres aangeduid is.';
      setTimeout(() => (this.isPrimarySite = true), 50);
    }
  }

  @dropTask
  *save(event) {
    event.preventDefault();
    let { address, administrativeUnit, contact, secondaryContact, site } =
      this.model;

    yield site.validate();
    yield address.validate();
    yield contact.validate();
    yield secondaryContact.validate();

    if (!this.hasValidationErrors) {
      if (address.hasDirtyAttributes) {
        if (!address.isCountryBelgium) {
          address.province = '';
        }
        address.fullAddress = combineFullAddress(address);
        address = setEmptyStringsToNull(address);

        yield address.save();
      }

      if (contact.hasDirtyAttributes) {
        contact.telephone = transformPhoneNumbers(contact.telephone);
        if (contact.isNew) {
          (yield site.contacts).push(contact);
        }
        contact = setEmptyStringsToNull(contact);

        yield contact.save();
      }

      if (secondaryContact.hasDirtyAttributes) {
        secondaryContact.telephone = transformPhoneNumbers(
          secondaryContact.telephone
        );
        if (secondaryContact.isNew) {
          (yield site.contacts).push(secondaryContact);
        }
        secondaryContact = setEmptyStringsToNull(secondaryContact);

        yield secondaryContact.save();
      }

      yield site.save();

      let nonPrimarySites = yield administrativeUnit.sites;

      if (this.isCurrentPrimarySite && !this.isPrimarySite) {
        nonPrimarySites.push(site);
        administrativeUnit.primarySite = null;
        yield administrativeUnit.save();
      } else if (this.isPrimarySite && !this.isCurrentPrimarySite) {
        let previousPrimarySite = this.model.currentPrimarySite;

        if (previousPrimarySite) {
          nonPrimarySites.push(previousPrimarySite);
        }

        administrativeUnit.primarySite = site;
        const oldSite = nonPrimarySites.find(
          (nonPrimarySite) => nonPrimarySite.id === site.id
        );
        const oldSiteIndex = nonPrimarySites.indexOf(oldSite);
        if (oldSiteIndex > -1) {
          nonPrimarySites.splice(oldSiteIndex, 1);
        }

        yield administrativeUnit.save();
      }

      // force it to be primary site if there is no primary site
      if (!administrativeUnit.primarySite?.get('id')) {
        administrativeUnit.primarySite = site;
        const siteIndex = nonPrimarySites.indexOf(site);
        if (siteIndex > -1) {
          nonPrimarySites.splice(siteIndex, 1);
        }
        yield administrativeUnit.save();
      }

      this.router.transitionTo(
        'administrative-units.administrative-unit.sites.site',
        site.id
      );
    }
  }

  reset() {
    this.resetUnsavedRecords();
    this.isNoPrimarySiteErrorMessage = null;
  }

  resetUnsavedRecords() {
    this.model.address.reset();
    this.model.administrativeUnit.reset();
    this.model.contact.reset();
    this.model.secondaryContact.reset();
    this.model.site.reset();
  }

  @action
  setSiteTypeName(e) {
    this.model.site.siteTypeName = e.target.value;
  }
}
