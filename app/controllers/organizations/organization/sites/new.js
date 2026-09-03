import Controller from '@ember/controller';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { combineFullAddress } from 'frontend-organization-portal/models/address';
import { tracked } from '@glimmer/tracking';
import { setEmptyStringsToNull } from 'frontend-organization-portal/utils/empty-string-to-null';
import { action } from '@ember/object';
import { saveRecord } from '@warp-drive/legacy/compat/builders';

export default class OrganizationsOrganizationSitesNewController extends Controller {
  @service router;
  @service store;
  @tracked isPrimarySite = false;

  get hasValidationErrors() {
    return (
      this.model.site.error ||
      this.model.address.error ||
      this.model.contact.error ||
      this.model.secondaryContact.error
    );
  }

  createSiteTask = dropTask(async (event) => {
    event.preventDefault();

    let { address, organization, contact, secondaryContact, site } = this.model;

    await site.validate();
    await address.validate();
    await contact.validate();
    await secondaryContact.validate();

    if (!this.hasValidationErrors) {
      contact = setEmptyStringsToNull(contact);
      await this.store.request(saveRecord(contact));

      secondaryContact = setEmptyStringsToNull(secondaryContact);
      await this.store.request(saveRecord(secondaryContact));

      if (!address.isPostcodeInFlanders) {
        address.province = '';
      }

      address.fullAddress = combineFullAddress(address);
      address = setEmptyStringsToNull(address);

      await this.store.request(saveRecord(address));

      site.address = address;

      (await site.contacts).push(contact, secondaryContact);
      await this.store.request(saveRecord(site));

      let nonPrimarySites = await organization.sites;

      if (this.isPrimarySite) {
        let previousPrimarySite = await organization.primarySite;

        if (previousPrimarySite) {
          nonPrimarySites.push(previousPrimarySite);
        }

        organization.primarySite = site;
      } else {
        nonPrimarySites.push(site);
      }

      await this.store.request(saveRecord(organization));

      this.router.replaceWith('organizations.organization.sites.site', site.id);
    }
  });

  reset() {
    this.isPrimarySite = false;
    this.removeUnsavedRecords();
  }

  removeUnsavedRecords() {
    let { site, address, contact, secondaryContact } = this.model;

    if (site.isNew) {
      site.deleteRecord();
      site.unloadRecord();
    }

    if (address.isNew) {
      address.deleteRecord();
      address.unloadRecord();
    }

    if (contact.isNew) {
      contact.deleteRecord();
      contact.unloadRecord();
    }

    if (secondaryContact.isNew) {
      secondaryContact.deleteRecord();
      secondaryContact.unloadRecord();
    }
  }

  @action
  setSiteTypeName(e) {
    this.model.site.siteTypeName = e.target.value;
  }
}
