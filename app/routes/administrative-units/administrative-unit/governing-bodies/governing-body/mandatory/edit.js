import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { createValidatedChangeset } from 'frontend-organization-portal/utils/changeset';
import mandatoryValidations from 'frontend-organization-portal/validations/mandatory';

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesGoverningBodyMandatoryEditRoute extends Route {
  @service store;
  @service currentSession;
  @service contactDetails;
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
      include: [
        'mandate.role-board',
        'contacts.contact-address',
        'type-half',
      ].join(),
    });

    const { id } = await mandatory.governingAlias;

    let mandate = await mandatory.mandate;
    let roleBoard = await mandate.roleBoard;

    let mandatoryChangeset = createValidatedChangeset(
      mandatory,
      mandatoryValidations
    );
    mandatoryChangeset.isCurrentPosition = !mandatoryChangeset.endDate;
    mandatoryChangeset.role = roleBoard;

    let { person, positions } =
      await this.contactDetails.getPersonAndAllPositions(id);
    const allContacts = await this.contactDetails.positionsToEditableContacts(
      positions
    );
    const currentContact = await this.contactDetails.mandatoryToPosition(
      mandatory,
      false
    );
    const currentContactChangeset =
      await this.contactDetails.positionToEditableContact(currentContact);

    return {
      contact: currentContactChangeset,
      administrativeUnit,
      governingBody,
      mandatory: mandatoryChangeset,
      allContacts,
      person,
    };
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
