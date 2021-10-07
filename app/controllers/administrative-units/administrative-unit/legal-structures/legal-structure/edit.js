import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { combineFullAddress } from 'frontend-contact-hub/models/address';

export default class AdministrativeUnitsAdministrativeUnitLegalStructuresLegalStructureEditController extends Controller {
  @service router;

  @dropTask
  *save(event) {
    event.preventDefault();

    yield this.model.associatedStructure.validate();
    yield this.model.legalType.validate();

    if (
      this.model.associatedStructure.isValid &&
      this.model.legalType.isValid
    ) {
      if (this.model.address.hasDirtyAttributes) {
        this.model.address.fullAddress = combineFullAddress(this.model.address);
        yield this.model.address.save();
      }

      let registration = yield this.model.associatedStructure.registration;
      let structuredIdentifier = yield registration.structuredIdentifier;
      yield structuredIdentifier.save();

      yield this.model.legalType.save();

      yield this.model.associatedStructure.save();

      this.router.transitionTo(
        'administrative-units.administrative-unit.legal-structures.legal-structure',
        this.model.associatedStructure.id
      );
    }
  }
}
