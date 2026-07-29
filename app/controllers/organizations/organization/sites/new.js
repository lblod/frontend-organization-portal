import Controller from '@ember/controller';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { combineFullAddress } from 'frontend-organization-portal/models/address';
import { tracked } from '@glimmer/tracking';
import { setEmptyStringsToNull } from 'frontend-organization-portal/utils/empty-string-to-null';
import { action } from '@ember/object';

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
      await contact.save();

      secondaryContact = setEmptyStringsToNull(secondaryContact);
      await secondaryContact.save();

      if (!address.isPostcodeInFlanders) {
        address.province = '';
      }

      address.fullAddress = combineFullAddress(address);
      address = setEmptyStringsToNull(address);

      await address.save();

      site.address = address;

      (await site.contacts).push(contact, secondaryContact);
      await site.save();

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

      await organization.save();

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
      site.destroyRecord();
    }

    if (address.isNew) {
      address.destroyRecord();
    }

    if (contact.isNew) {
      contact.destroyRecord();
    }

    if (secondaryContact.isNew) {
      secondaryContact.destroyRecord();
    }
  }

  @action
  setSiteTypeName(e) {
    this.model.site.siteTypeName = e.target.value;
  }
}
