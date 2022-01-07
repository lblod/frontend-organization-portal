import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';

export default class AdministrativeUnitsAdministrativeUnitChangeEventsDetailsEditController extends Controller {
  @service router;

  @dropTask
  *save(event) {
    event.preventDefault();

    let { changeEvent, decision } = this.model;

    yield changeEvent.validate();
    yield decision.validate();

    if (changeEvent.isValid && decision.isValid) {
      if (changeEvent.isDirty) {
        yield changeEvent.save();
      }

      if (decision.isDirty) {
        yield decision.save();
      }

      this.router.transitionTo(
        'administrative-units.administrative-unit.change-events.details',
        changeEvent.id
      );
    }
  }
}
