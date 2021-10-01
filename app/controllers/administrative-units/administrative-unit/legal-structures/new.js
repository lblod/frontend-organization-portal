import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { combineFullAddress } from 'frontend-contact-hub/models/address';

export default class AdministrativeUnitsAdministrativeUnitLegalStructuresNewController extends Controller {
  @service router;
  @service store;

  @dropTask
  *createAssociatedStructureTask(event) {
    event.preventDefault();

    let {
      associatedStructure,
      address,
      legalType,
      registration,
      structuredIdentifier,
    } = this.model;

    address.fullAddress = combineFullAddress(address);
    yield address.save();

    yield legalType.save();

    yield structuredIdentifier.save();
    registration.structuredIdentifier = structuredIdentifier;
    yield registration.save();

    associatedStructure.address = address;
    associatedStructure.legalType = legalType;
    associatedStructure.registration = registration;
    yield associatedStructure.save();

    this.model.administrativeUnit.associatedStructures.pushObject(
      associatedStructure
    );
    yield this.model.administrativeUnit.save();

    this.router.replaceWith(
      'administrative-units.administrative-unit.legal-structures.legal-structure',
      associatedStructure.id
    );
  }

  reset() {
    this.removeUnsavedRecords();
  }

  removeUnsavedRecords() {
    this.model.associatedStructure.rollbackAttributes();
    this.model.address.rollbackAttributes();
    this.model.legalType.rollbackAttributes();
    this.model.registration.rollbackAttributes();
    this.model.structuredIdentifier.rollbackAttributes();
  }
}
