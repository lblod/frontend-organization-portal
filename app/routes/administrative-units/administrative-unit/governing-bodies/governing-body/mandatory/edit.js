import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { createValidatedChangeset } from 'frontend-contact-hub/utils/changeset';
import { getAddressValidations } from 'frontend-contact-hub/validations/address';
import contactValidations from 'frontend-contact-hub/validations/contact-point';
import mandatoryValidations from 'frontend-contact-hub/validations/mandatory';
import { findPrimaryContact } from 'frontend-contact-hub/utils/contact';

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesGoverningBodyMandatoryEditRoute extends Route {
  @service store;

  async model({ mandatoryId }) {
    let administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit'
    );

    let { governingBody } = this.modelFor(
      'administrative-units.administrative-unit.governing-bodies.governing-body'
    );

    let mandatory = await this.store.findRecord('mandatory', mandatoryId, {
      include: 'mandate.role-board,contacts.contact-address,type-half',
    });

    let contacts = await mandatory.contacts;

    let primaryContact = await findPrimaryContact(contacts.toArray());

    if (!primaryContact) {
      primaryContact = this.store.createRecord('contact-point');
      contacts.pushObject(primaryContact);
    }

    let address = await primaryContact.contactAddress;

    if (!address) {
      address = this.store.createRecord('address');
      primaryContact.contactAddress = address;
    }

    let mandate = await mandatory.mandate;
    let roleBoard = await mandate.roleBoard;

    let mandatoryChangeset = createValidatedChangeset(
      mandatory,
      mandatoryValidations
    );
    mandatoryChangeset.isCurrentPosition = !mandatoryChangeset.endDate;
    mandatoryChangeset.role = roleBoard;

    return {
      administrativeUnit,
      governingBody,
      mandatory: mandatoryChangeset,
      contact: createValidatedChangeset(primaryContact, contactValidations),
      contactRecord: primaryContact,
      address: createValidatedChangeset(address, getAddressValidations(false)),
      addressRecord: address,
      person: await mandatory.governingAlias,
    };
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
