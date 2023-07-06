import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { combineFullAddress } from 'frontend-organization-portal/models/address';
import { action } from '@ember/object';
import { setEmptyStringsToNull } from 'frontend-organization-portal/utils/empty-string-to-null';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default class AdministrativeUnitsAdministrativeUnitCoreDataEditController extends Controller {
  @service router;

  get isWorshipAdministrativeUnit() {
    return this.isWorshipService || this.isCentralWorshipService;
  }

  get isWorshipService() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.WORSHIP_SERVICE
    );
  }

  get isCentralWorshipService() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE
    );
  }

  get isMunicipality() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.MUNICIPALITY
    );
  }

  get isProvince() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.PROVINCE
    );
  }

  get isAgb() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.AGB
    );
  }

  get isApb() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.APB
    );
  }

  get isIGS() {
    const typesThatAreIGS = [
      CLASSIFICATION_CODE.PROJECTVERENIGING,
      CLASSIFICATION_CODE.DIENSTVERLENENDE_VERENIGING,
      CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING,
      CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
    ];
    return typesThatAreIGS.includes(
      this.model.administrativeUnit.classification?.get('id')
    );
  }

  @action
  setKbo(value) {
    this.model.structuredIdentifierKBO.localId = value;
  }
  @action
  setRelation(unit) {
    this.model.administrativeUnit.isSubOrganizationOf = unit;
    if (this.isAgb || this.isApb)
      this.model.administrativeUnit.wasFoundedByOrganization = unit;
  }
  @dropTask
  *save(event) {
    event.preventDefault();
    let {
      administrativeUnit,
      address,
      contact,
      secondaryContact,
      identifierSharepoint,
      identifierKBO,
      structuredIdentifierSharepoint,
      structuredIdentifierKBO,
    } = this.model;

    yield Promise.all([
      administrativeUnit.validate(),
      address.validate(),
      contact.validate(),
      secondaryContact.validate(),
      structuredIdentifierKBO.validate(),
    ]);

    if (
      administrativeUnit.isValid &&
      address.isValid &&
      contact.isValid &&
      secondaryContact.isValid &&
      structuredIdentifierKBO.isValid
    ) {
      let primarySite = yield administrativeUnit.primarySite;

      // TODO : "if" not needed when the data of all administrative units will be correct
      // they should all have a primary site on creation
      if (!primarySite) {
        primarySite = primarySite = this.store.createRecord('site');
        primarySite.address = address;
        administrativeUnit.primarySite = primarySite;
      }

      if (address.isDirty) {
        address.fullAddress = combineFullAddress(address);
        address = setEmptyStringsToNull(address);
        yield address.save();
      }

      let siteContacts = yield primarySite.contacts;

      if (contact.isDirty) {
        let isNewContact = contact.isNew;

        contact = setEmptyStringsToNull(contact);
        yield contact.save();

        if (isNewContact) {
          siteContacts.pushObject(contact);
          yield primarySite.save();
        }
      }

      if (secondaryContact.isDirty) {
        let isNewContact = secondaryContact.isNew;

        secondaryContact = setEmptyStringsToNull(secondaryContact);
        yield secondaryContact.save();

        if (isNewContact) {
          siteContacts.pushObject(secondaryContact);
          yield primarySite.save();
        }
      }

      structuredIdentifierKBO = setEmptyStringsToNull(structuredIdentifierKBO);
      yield structuredIdentifierKBO.save();
      yield identifierKBO.save();

      structuredIdentifierSharepoint = setEmptyStringsToNull(
        structuredIdentifierSharepoint
      );
      yield structuredIdentifierSharepoint.save();
      yield identifierSharepoint.save();

      administrativeUnit = setEmptyStringsToNull(administrativeUnit);
      if (this.isProvince || this.isMunicipality) {
        // set province or municipality name to null as data are already in the shared graph
        administrativeUnit.name = null;
        yield administrativeUnit.save();
        yield administrativeUnit.reload();
      } else {
        yield administrativeUnit.save();
      }

      this.router.transitionTo(
        'administrative-units.administrative-unit.core-data',
        administrativeUnit.id
      );
    }
  }
  get classificationCodes() {
    return [CLASSIFICATION_CODE.MUNICIPALITY];
  }
}
