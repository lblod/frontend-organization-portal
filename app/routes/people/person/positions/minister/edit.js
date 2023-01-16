import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { createValidatedChangeset } from 'frontend-organization-portal/utils/changeset';
import ministerValidations from 'frontend-organization-portal/validations/minister';

export default class PeoplePersonPositionsMinisterEditRoute extends Route {
  @service currentSession;
  @service router;
  @service contactDetails;
  @service store;

  beforeModel() {
    // Disabling positions creation and edition, they now happen in Loket.
    const positionsCantBeCreatedOrEdited = new Date() >= new Date('2023-02-01');
    if (!this.currentSession.canEdit || positionsCantBeCreatedOrEdited) {
      this.router.transitionTo('route-not-found', {
        wildcard: 'pagina-niet-gevonden',
      });
    }
  }
  async model() {
    let { minister } = this.modelFor('people.person.positions.minister');

    let { id } = await minister.person;

    let ministerChangeset = createValidatedChangeset(
      minister,
      ministerValidations
    );
    ministerChangeset.isCurrentPosition = !minister.agentEndDate;

    const { person, positions } =
      await this.contactDetails.getPersonAndAllPositions(id);
    const allContacts = await this.contactDetails.positionsToEditableContacts(
      positions
    );
    const currentContact = await this.contactDetails.ministerToPosition(
      minister,
      false
    );
    const currentContactChangeset =
      await this.contactDetails.positionToEditableContact(currentContact);
    return {
      minister: ministerChangeset,
      contact: currentContactChangeset,
      allContacts,
      person,
    };
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.setup();
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
