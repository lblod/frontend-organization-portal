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

  beforeModel() {
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('route-not-found', {
        wildcard: 'pagina-niet-gevonden',
      });
    }
  }
  async model({ personId, positionId }, transition) {
    if (personId) {
      transition.data.person = await this.store.findRecord('person', personId);
    }

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
    }
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
