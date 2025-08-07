import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { combineFullAddress } from 'frontend-organization-portal/models/address';
import { action } from '@ember/object';
import { setEmptyStringsToNull } from 'frontend-organization-portal/utils/empty-string-to-null';
import isContactEditableOrganization from 'frontend-organization-portal/utils/editable-contact-data';
import { tracked } from '@glimmer/tracking';

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
      this.model.identifierKBO.error ||
      this.model.identifierSharepoint.error
    );
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

  @dropTask
  *save(event) {
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
        ? yield this.scopeOfOperation.getScopeForLocations(
            ...this.locationsInScope,
          )
        : undefined;

    yield Promise.all([
      organization.validate({ relaxMandatoryFoundingOrganization: true }),
      identifierKBO.validate(),
      identifierSharepoint.validate(),
    ]);

    if (
      this.features.isEnabled('edit-contact-data') ||
      isContactEditableOrganization(this.model.organization)
    ) {
      yield Promise.all([
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
        let primarySite = yield organization.primarySite;

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
          yield address.save();
        }

        let siteContacts = yield primarySite.contacts;

        if (contact.hasDirtyAttributes) {
          let isNewContact = contact.isNew;

          contact = setEmptyStringsToNull(contact);
          yield contact.save();

          if (isNewContact) {
            siteContacts.push(contact);
            yield primarySite.save();
          }
        }

        if (secondaryContact.hasDirtyAttributes) {
          let isNewContact = secondaryContact.isNew;

          secondaryContact = setEmptyStringsToNull(secondaryContact);
          yield secondaryContact.save();

          if (isNewContact) {
            siteContacts.push(secondaryContact);
            yield primarySite.save();
          }
        }
      }

      structuredIdentifierKBO = setEmptyStringsToNull(structuredIdentifierKBO);
      yield structuredIdentifierKBO.save();
      yield identifierKBO.save();

      // FIXME: If uncommented existing SharePoint identifier is not removed
      // when user removes the value in the form. Commenting it a quick, dirty
      // fix because it overwrites the previous value with an empty string
      // instead of leaving it untouched.
      // structuredIdentifierSharepoint = setEmptyStringsToNull(
      //   structuredIdentifierSharepoint,
      // );
      yield structuredIdentifierSharepoint.save();
      yield identifierSharepoint.save();

      organization = setEmptyStringsToNull(organization);
      yield organization.save();

      const syncKboData = `/kbo-data-sync/${structuredIdentifierKBO.id}`;
      yield fetch(syncKboData, {
        method: 'POST',
      });

      this.router.refresh();
      this.router.transitionTo(
        'organizations.organization.core-data',
        organization.id,
      );
    }
  }

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
