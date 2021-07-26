import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesGoverningBodyMandatoryEditRoute extends Route {
  @service store;

  async model({ mandatoryId: mandatoryId }) {
    let adminUnitGovBodyTemps = this.modelFor(
      'administrative-units.administrative-unit.governing-bodies'
    );

    let { governingBodyId: govBodyTempId } = this.paramsFor(
      'administrative-units.administrative-unit.governing-bodies.governing-body'
    );

    let govBodyTemp = await this.store.findRecord(
      'governing-body',
      govBodyTempId
    );

    let mandatory = await this.store.findRecord('mandatory', mandatoryId, {
      include: 'mandate.role-board,contacts,contacts.contact-address',
    });

    let contacts = await mandatory.get('contacts');
    if (contacts.length === 0) {
      let address = this.store.createRecord('address');
      let contact = this.store.createRecord('contact-point');
      contact.address = address;
      contacts.pushObject(contact);
    } else if (contacts.length === 1) {
      if (contacts.firstObject.contactAddress) {
        let address = this.store.createRecord('address');
        contacts.firstObject.address = address;
      }
    }

    return {
      administrativeUnit: await adminUnitGovBodyTemps.administrativeUnit,
      govBodyTemps: await adminUnitGovBodyTemps.governingBody
        .hasTimeSpecializations,
      govBodyTemp,
      mandatory,
      person: await mandatory.governingAlias,
    };
  }
}
