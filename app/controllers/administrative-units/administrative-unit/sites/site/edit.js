import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { combineFullAddress } from 'frontend-contact-hub/models/address';

export default class AdministrativeUnitsAdministrativeUnitSitesSiteEditController extends Controller {
  @service router;
  @tracked isPrimarySite;

  setup() {
    this.isPrimarySite = this.isPrimarySiteCurrent;
  }

  get site() {
    return this.model.site;
  }

  get address() {
    return this.model.address;
  }

  get contacts() {
    return this.model.contacts;
  }

  get administrativeUnit() {
    return this.model.administrativeUnit;
  }

  get isPrimarySiteCurrent() {
    return (
      this.site.get('id') === this.administrativeUnit.get('primarySite.id')
    );
  }

  @dropTask
  *save(event) {
    event.preventDefault();

    yield this.site.validate();
    yield this.address.validate();

    if (this.site.isValid && this.address.isValid) {
      if (this.address.hasDirtyAttributes) {
        this.address.fullAddress = combineFullAddress(this.address);
        yield this.address.save();
      }

      if (this.contacts.firstObject.hasDirtyAttributes) {
        yield this.contacts.firstObject.save();
      }

      yield this.site.save();

      if (this.isPrimarySiteCurrent && !this.isPrimarySite) {
        this.administrativeUnit.sites.pushObject(this.site);

        this.administrativeUnit.primarySite = null;

        yield this.administrativeUnit.save();
      }

      if (this.isPrimarySite && !this.isPrimarySiteCurrent) {
        this.administrativeUnit.primarySite = this.site;

        this.administrativeUnit.sites.removeObject(this.site);

        yield this.administrativeUnit.save();
      }

      this.router.transitionTo(
        'administrative-units.administrative-unit.sites.site',
        this.site.id
      );
    }
  }
}
