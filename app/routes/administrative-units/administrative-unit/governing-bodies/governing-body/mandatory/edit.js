import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesGoverningBodyMandatoryEditRoute extends Route {
  @service store;

  async model({ mandatoryId }) {
    let administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit'
    );

    let { governingBody } = this.modelFor(
      'administrative-units.administrative-unit.governing-bodies.governing-body'
    );

    let mandatory = await this.store.findRecord('mandatory', mandatoryId, {
      include: 'mandate.role-board,contacts.contact-address,type-half',
    });

    let contacts = await mandatory.contacts;
    if (contacts.length === 0) {
      let contact = this.store.createRecord('contact-point');
      let address = this.store.createRecord('address');
      contact.contactAddress = address;
      contacts.pushObject(contact);
    } else if (!contacts.firstObject.contactAddress) {
      let address = this.store.createRecord('address');
      contacts.firstObject.contactAddress = address;
    }

    let mandate = await mandatory.mandate;

    return {
      administrativeUnit,
      governingBody,
      mandatory,
      roleBoard: await mandate.roleBoard,
      person: await mandatory.governingAlias,
    };
  }
}
