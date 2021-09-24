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

    if (this.model.associatedStructure.isValid) {
      let address = yield this.model.associatedStructure.address;

      if (address.hasDirtyAttributes) {
        address.fullAddress = combineFullAddress(address);
        yield address.save();
      }

      let registration = yield this.model.associatedStructure.registration;
      let structuredIdentifier = yield registration.structuredIdentifier;
      yield structuredIdentifier.save();

      let legalType = yield this.model.associatedStructure.legalType;
      yield legalType.save();

      yield this.model.associatedStructure.save();

      this.router.transitionTo(
        'administrative-units.administrative-unit.legal-structures.legal-structure',
        this.model.associatedStructure.id
      );
    }
  }
}
