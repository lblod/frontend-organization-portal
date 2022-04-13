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
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('route-not-found', {
        wildcard: 'pagina-niet-gevonden',
      });
    }
  }
  async model() {
    let { minister } = this.modelFor('people.person.positions.minister');

    let { id } = await minister.person;
    const { person, positions } =
      await this.contactDetails.getPersonAndAllPositions(id);
    const allContacts = await this.contactDetails.positionsToEditableContacts(
      positions
    );

    let ministerChangeset = createValidatedChangeset(
      minister,
      ministerValidations
    );
    ministerChangeset.isCurrentPosition = !minister.agentEndDate;

    return {
      minister: ministerChangeset,
      contact: allContacts.find((c) => c.position.id === minister.id),
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
