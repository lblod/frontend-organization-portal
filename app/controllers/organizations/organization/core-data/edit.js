import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { combineFullAddress } from 'frontend-organization-portal/models/address';
import { action } from '@ember/object';
import { setEmptyStringsToNull } from 'frontend-organization-portal/utils/empty-string-to-null';
import { transformPhoneNumbers } from 'frontend-organization-portal/utils/transform-phone-numbers';

export default class OrganizationsOrganizationCoreDataEditController extends Controller {
  @service router;
  @service store;
  @service features;

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
  setKbo(value) {
    this.model.structuredIdentifierKBO.localId = value;
  }

  @action
  setRelation(unit) {
    this.model.organization.isSubOrganizationOf = Array.isArray(unit)
      ? unit[0]
      : unit;

    if (
      this.model.organization.isAgb ||
      this.model.organization.isApb ||
      this.model.organization.isOcmwAssociation ||
      this.model.organization.isPevaMunicipality ||
      this.model.organization.isPevaProvince
    ) {
      this.model.organization.wasFoundedByOrganizations = Array.isArray(unit)
        ? unit
        : unit
        ? [unit]
        : [];
    }
  }

  @action
  setHasParticipants(units) {
    this.model.organization.hasParticipants = units;
  }

  @action
  setMunicipality(municipality) {
    this.model.organization.isAssociatedWith = municipality;
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

    yield Promise.all([
      organization.validate({ relaxMandatoryFoundingOrganization: true }),
      identifierKBO.validate(),
      identifierSharepoint.validate(),
    ]);

    if (
      this.features.isEnabled('edit-contact-data') ||
      organization.isPrivateOcmwAssociation
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
        organization.isPrivateOcmwAssociation
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
          if (!address.isCountryBelgium) {
            address.province = '';
          }
          address.fullAddress = combineFullAddress(address);
          address = setEmptyStringsToNull(address);
          yield address.save();
        }

        let siteContacts = yield primarySite.contacts;

        if (contact.hasDirtyAttributes) {
          let isNewContact = contact.isNew;

          contact.telephone = transformPhoneNumbers(contact.telephone);
          contact = setEmptyStringsToNull(contact);
          yield contact.save();

          if (isNewContact) {
            siteContacts.push(contact);
            yield primarySite.save();
          }
        }

        if (secondaryContact.hasDirtyAttributes) {
          let isNewContact = secondaryContact.isNew;

          secondaryContact.telephone = transformPhoneNumbers(
            secondaryContact.telephone
          );
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
        organization.id
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
  }
}
