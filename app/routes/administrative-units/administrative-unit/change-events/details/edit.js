import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { CHANGE_EVENT_TYPE } from 'frontend-contact-hub/models/change-event-type';
import { createValidatedChangeset } from 'frontend-contact-hub/utils/changeset';
import {
  changeEventValidations,
  decisionValidations,
} from 'frontend-contact-hub/validations/change-event';

export default class AdministrativeUnitsAdministrativeUnitChangeEventsDetailsEditRoute extends Route {
  @service currentSession;
  @service router;
  @service store;

  beforeModel() {
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('route-not-found', {
        wildcard: 'pagina-niet-gevonden',
      });
    }
  }

  async model() {
    let { changeEvent, ...detailsPageModel } = this.modelFor(
      'administrative-units.administrative-unit.change-events.details'
    );

    let changeEventType = await changeEvent.type;
    let canAddDecisionInformation =
      changeEventType.id !== CHANGE_EVENT_TYPE.RECOGNITION_REQUESTED;

    let model = {
      ...detailsPageModel,
      changeEvent: createValidatedChangeset(
        changeEvent,
        changeEventValidations
      ),
      canAddDecisionInformation,
    };

    if (canAddDecisionInformation) {
      let decision = await changeEvent.decision;
      model.decision = createValidatedChangeset(decision, decisionValidations);
    }

    return model;
  }
}
