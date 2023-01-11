import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { createValidatedChangeset } from 'frontend-organization-portal/utils/changeset';
import { mandatoryWithRequiredRoleValidations } from 'frontend-organization-portal/validations/mandatory';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesGoverningBodyBoardMemberNewRoute extends Route {
  @service store;
  @service currentSession;
  @service router;
  @service contactDetails;

  beforeModel() {
    // Disabling positions creation and edition, they now happen in Loket.
    const positionsCantBeCreatedOrEdited = new Date() >= new Date('2023-02-01');
    if (!this.currentSession.canEdit || positionsCantBeCreatedOrEdited) {
      this.router.transitionTo('route-not-found', {
        wildcard: 'pagina-niet-gevonden',
      });
    }
  }

  async model({ personId, positionId }, transition) {
    let { governingBody } = this.modelFor(
      'administrative-units.administrative-unit.governing-bodies.governing-body'
    );

    const administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit'
    );
    const classification = await administrativeUnit.classification;
    let mandatory;

    if (
      classification.id == CLASSIFICATION_CODE.WORSHIP_SERVICE ||
      classification.id == CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE
    ) {
      mandatory = this.store.createRecord('worship-mandatory');
    } else {
      mandatory = this.store.createRecord('mandatory');
    }

    mandatory.isCurrentPosition = true;
    if (positionId) {
      let role = await this.store.findRecord('board-position-code', positionId);
      mandatory.role = role;
      mandatory.typeHalf = undefined;
    }
    if (personId) {
      const { person, positions } =
        await this.contactDetails.getPersonAndAllPositions(personId);
      transition.data.allContacts =
        await this.contactDetails.positionsToEditableContacts(positions);
      transition.data.person = person;
      transition.data.contact = { position: mandatory };
    }

    return {
      administrativeUnit,
      governingBody,
      mandatory: createValidatedChangeset(
        mandatory,
        mandatoryWithRequiredRoleValidations
      ),
      mandatoryRecord: mandatory,
    };
  }

  setupController(controller, model, transition) {
    super.setupController(...arguments);

    if (transition.data.person) {
      controller.targetPerson = transition.data.person;
      controller.contact = transition.data.contact;
      controller.allContacts = transition.data.allContacts;
    }
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
