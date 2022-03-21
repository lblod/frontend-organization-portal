import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import {
  createPrimaryContact,
  createSecondaryContact,
  findPrimaryContact,
  findSecondaryContact,
} from 'frontend-organization-portal/models/contact-point';
import { createValidatedChangeset } from 'frontend-organization-portal/utils/changeset';
import { getAddressValidations } from 'frontend-organization-portal/validations/address';
import contactValidations from 'frontend-organization-portal/validations/contact-point';
import mandatoryValidations from 'frontend-organization-portal/validations/mandatory';

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesGoverningBodyMandatoryEditRoute extends Route {
  @service store;
  @service currentSession;
  @service router;

  beforeModel() {
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('route-not-found', {
        wildcard: 'pagina-niet-gevonden',
      });
    }
  }

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

    let primaryContact = findPrimaryContact(contacts);
    if (!primaryContact) {
      primaryContact = createPrimaryContact(this.store);
    }

    let secondaryContact = findSecondaryContact(contacts);
    if (!secondaryContact) {
      secondaryContact = createSecondaryContact(this.store);
    }

    let address = await primaryContact.contactAddress;

    if (!address) {
      address = this.store.createRecord('address');
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
      secondaryContact: createValidatedChangeset(
        secondaryContact,
        contactValidations
      ),
      secondaryContactRecord: secondaryContact,
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
