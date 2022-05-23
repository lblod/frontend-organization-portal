import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesGoverningBodyEditController extends Controller {
  @service router;

  @action
  cancel() {
    this.model.governingBody.rollbackAttributes();
    this.router.transitionTo(
      'administrative-units.administrative-unit.governing-bodies.governing-body'
    );
  }
  @dropTask
  *save(event) {
    event.preventDefault();

    yield this.model.governingBody.save();

    this.router.transitionTo(
      'administrative-units.administrative-unit.governing-bodies.governing-body',
      this.model.governingBody.id
    );
  }
}
