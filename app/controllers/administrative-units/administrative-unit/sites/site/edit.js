import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default class AdministrativeUnitsAdministrativeUnitSitesSiteEditController extends Controller {
  @service router;

  get site() {
    return this.model.adminUnitSite.site;
  }

  @dropTask
  *save(event) {
    event.preventDefault();

    let address = yield this.site.address;

    if (address.hasDirtyAttributes) {
      let fullStreet = `${address.street || ''} ${address.number || ''} ${
        address.boxNumber || ''
      }`.trim();

      let muncipalityInformation = `${address.postcode || ''} ${
        address.municipality || ''
      }`.trim();

      if (fullStreet && muncipalityInformation) {
        address.fullAddress = `${fullStreet}, ${muncipalityInformation}`;
      } else if (fullStreet) {
        address.fullAddress = fullStreet;
      } else {
        address.fullAddress = muncipalityInformation;
      }

      yield address.save();
    }

    let contacts = yield this.site.contacts;
    if (contacts.firstObject.hasDirtyAttributes) {
      yield contacts.firstObject.save();
    }

    yield this.site.save();

    this.router.transitionTo(
      'administrative-units.administrative-unit.sites.site',
      this.site.id
    );
  }
}
