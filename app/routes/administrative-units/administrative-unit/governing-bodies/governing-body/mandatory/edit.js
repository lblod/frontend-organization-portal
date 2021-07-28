import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesGoverningBodyMandatoryEditRoute extends Route {
  @service store;

  async model({ mandatoryId }) {
    let { governingBodyId: govBodyTempId } = this.paramsFor(
      'administrative-units.administrative-unit.governing-bodies.governing-body'
    );

    let governingBody = await this.store.findRecord(
      'governing-body',
      govBodyTempId,
      { include: 'administrativeUnit' }
    );

    let mandatory = await this.store.findRecord('mandatory', mandatoryId, {
      include: 'mandate.role-board,contacts.contact-address',
    });

    let contacts = await mandatory.contacts;
    if (contacts.length === 0) {
      let contact = this.store.createRecord('contact-point');
      let address = this.store.createRecord('address');
      contact.address = address;
      contacts.pushObject(contact);
    } else if (contacts.length === 1) {
      if (!contacts.firstObject.contactAddress) {
        let address = this.store.createRecord('address');
        contacts.firstObject.address = address;
      }
    }

    return {
      administrativeUnit: await governingBody.administrativeUnit,
      governingBody,
      mandatory,
      person: await mandatory.governingAlias,
    };
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.setup();
  }
}
