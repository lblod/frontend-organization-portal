import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { service } from '@ember/service';
import { combineFullAddress } from 'frontend-organization-portal/models/address';
import { action } from '@ember/object';
import { setEmptyStringsToNull } from 'frontend-organization-portal/utils/empty-string-to-null';
import isContactEditableOrganization from 'frontend-organization-portal/utils/editable-contact-data';
import { tracked } from '@glimmer/tracking';
import requiresKbo from '../../../../helpers/requires-kbo';

export default class OrganizationsOrganizationCoreDataEditController extends Controller {
  @service router;
  @service store;
  @service features;
  @service scopeOfOperation;

  @tracked locationsInScope;

  get hasValidationErrors() {
    return (
      this.model.organization.error ||
      this.model.address.error ||
      this.model.contact.error ||
      this.model.secondaryContact.error ||
      (requiresKbo(this.model.organization) &&
        this.model.identifierKBO?.error) ||
      this.model.identifierSharepoint.error
    );
  }

  get vendorsString() {
    const vendors = this.model.organization.hasMany('vendors').value();
    if (!vendors || !vendors.length) {
      return 'Loket voor Lokale Besturen';
    }
    return vendors.map((item) => item.name).join(', ');
  }

  @action
  setNames(name) {
    this.model.organization.setAbbName(name);
  }

  @action
  setAlternativeNames(names) {
    this.model.organization.setAlternativeName(names);
  }

  @action
  setKbo(event) {
    this.model.structuredIdentifierKBO.localId =
      event.target.inputmask.unmaskedvalue();
  }

  save = dropTask(async (event) => {
    event.preventDefault();

    let {
      organization,
      address,
      contact,
      secondaryContact,
      identifierSharepoint,
      identifierKBO,
      structuredIdentifierSharepoint,
      structuredIdentifierKBO,
    } = this.model;

    // NOTE (05/06/2025): Explicitly set the scope to `undefined` when the user
    // did not select any locations, or removed all originally set
    // locations. Otherwise, any edits are ignored and the previously set scope
    // of operation is just silently kept.
    organization.scope =
      this.locationsInScope?.length > 0
        ? await this.scopeOfOperation.getScopeForLocations(
            ...this.locationsInScope,
          )
        : undefined;

    await Promise.all([
      organization.validate({ relaxMandatoryFoundingOrganization: true }),
      identifierSharepoint.validate(),
    ]);

    const requiresKboNumber = requiresKbo(organization);

    if (requiresKboNumber) {
      await identifierKBO.validate();
    }

    if (
      this.features.isEnabled('edit-contact-data') ||
      isContactEditableOrganization(this.model.organization)
    ) {
      await Promise.all([
        address.validate(),
        contact.validate(),
        secondaryContact.validate(),
      ]);
    }

    if (!this.hasValidationErrors) {
      if (
        this.features.isEnabled('edit-contact-data') ||
        isContactEditableOrganization(this.model.organization)
      ) {
        let primarySite = await organization.primarySite;

        // TODO: "if" not needed when the data of all organizations will be
        // correct they should all have a primary site on creation
        if (!primarySite) {
          primarySite = this.store.createRecord('site');
          primarySite.address = address;
          organization.primarySite = primarySite;
        }

        if (address.hasDirtyAttributes) {
          if (!address.isPostcodeInFlanders) {
            address.province = '';
          }
          address.fullAddress = combineFullAddress(address);
          address = setEmptyStringsToNull(address);
          await address.save();
        }

        let siteContacts = await primarySite.contacts;

        if (contact.hasDirtyAttributes) {
          let isNewContact = contact.isNew;

          contact = setEmptyStringsToNull(contact);
          await contact.save();

          if (isNewContact) {
            siteContacts.push(contact);
            await primarySite.save();
          }
        }

        if (secondaryContact.hasDirtyAttributes) {
          let isNewContact = secondaryContact.isNew;

          secondaryContact = setEmptyStringsToNull(secondaryContact);
          await secondaryContact.save();

          if (isNewContact) {
            siteContacts.push(secondaryContact);
            await primarySite.save();
          }
        }
      }

      if (requiresKboNumber) {
        structuredIdentifierKBO = setEmptyStringsToNull(
          structuredIdentifierKBO,
        );
        await structuredIdentifierKBO.save();
        await identifierKBO.save();
      }

      // FIXME: If uncommented existing SharePoint identifier is not removed
      // when user removes the value in the form. Commenting it a quick, dirty
      // fix because it overwrites the previous value with an empty string
      // instead of leaving it untouched.
      // structuredIdentifierSharepoint = setEmptyStringsToNull(
      //   structuredIdentifierSharepoint,
      // );
      await structuredIdentifierSharepoint.save();
      await identifierSharepoint.save();

      organization = setEmptyStringsToNull(organization);
      await organization.save();

      if (requiresKboNumber) {
        const syncKboData = `/kbo-data-sync/${structuredIdentifierKBO.id}`;
        await fetch(syncKboData, {
          method: 'POST',
        });
      }

      this.router.refresh();
      this.router.transitionTo(
        'organizations.organization.core-data',
        organization.id,
      );
    }
  });

  resetUnsavedRecords() {
    this.model.organization.reset();
    this.model.contact.reset();
    this.model.secondaryContact.reset();
    this.model.address.reset();
    this.model.structuredIdentifierKBO.rollbackAttributes();
    this.model.identifierKBO.reset();
    this.model.structuredIdentifierSharepoint.rollbackAttributes();
    this.model.identifierSharepoint.reset();
  }

  reset() {
    this.resetUnsavedRecords();
    this.locationsInScope = [];
  }
}
