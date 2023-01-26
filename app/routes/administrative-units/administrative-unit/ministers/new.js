import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { createValidatedChangeset } from 'frontend-organization-portal/utils/changeset';
import ministerValidations, {
  positionValidations,
} from 'frontend-organization-portal/validations/minister';

export default class AdministrativeUnitsAdministrativeUnitMinistersNewRoute extends Route {
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
    let minister = this.store.createRecord('minister');
    minister.isCurrentPosition = true;
    let position = this.store.createRecord('minister-position');
    if (positionId) {
      let role = await this.store.findRecord(
        'minister-position-function',
        positionId
      );
      position.function = role;
    }
    if (personId) {
      const { person, positions } =
        await this.contactDetails.getPersonAndAllPositions(personId);
      transition.data.allContacts =
        await this.contactDetails.positionsToEditableContacts(positions);
      transition.data.person = person;
      transition.data.contact = { position: minister };
    }
    return {
      administrativeUnit: this.modelFor(
        'administrative-units.administrative-unit'
      ),
      minister: createValidatedChangeset(minister, ministerValidations),
      ministerRecord: minister,
      position: createValidatedChangeset(position, positionValidations),
      positionRecord: position,
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
