import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { assert } from '@ember/debug';
import {
  findPrimaryContact,
  findSecondaryContact,
} from '../../../models/contact-point';

export default class PeoplePersonPersonalInformationRoute extends Route {
  @service store;

  async model() {
    let { id: personId } = this.paramsFor('people.person');

    let person = await this.store.findRecord('person', personId, {
      reload: true,
      include: [
        'mandatories.mandate.governing-body.is-time-specialization-of.administrative-unit.classification',
        'mandatories.contacts',
        'agents-in-position',
      ].join(),
    });
    const contacts = [];
    const mandatories = person.mandatories.filter((m) =>
      this.isActivePosition(m.endDate)
    );

    /* .map(m => {
        const ma
        const classification = m.mandate.governingBody.isTimeSpecializationOf.administrativeUnit.classification.label
      })
      .sort((a, b) => {
        return new Date(b.startDate) - new Date(a.startDate);
      });*/
    const ministers = person.agentsInPosition.filter((m) =>
      this.isActivePosition(m.agentEndDate)
    );
    /* .sort((a, b) => {
        return new Date(b.agentStartDate) - new Date(a.agentStartDate);
      });*/

    for (let mandatory of mandatories) {
      const mandate = await mandatory.mandate;
      const role = await mandate.roleBoard;
      const governingBody = await mandate.governingBody;
      const isTimeSpecializationOf = await governingBody.isTimeSpecializationOf;
      const administrativeUnit =
        await isTimeSpecializationOf.administrativeUnit;
      //const classification =  await administrativeUnit.classification;
      const mContacts = await mandatory.contacts;
      const primaryContact = findPrimaryContact(mContacts);
      const secondaryContact = findSecondaryContact(mContacts);
      contacts.push({
        title: `${role.label}, ${administrativeUnit.name}`,
        role: role.label,
        startDate: mandate.startDate,
        endDate: mandate.endDate,
        unitId: administrativeUnit.id,
        unitName: administrativeUnit.name,
        // classification: classification,
        primaryContact: await this.mapContact(primaryContact),
        secondaryContact: await this.mapContact(secondaryContact),
      });
    }

    for (let minister of ministers) {
      const position = await minister.position;
      const role = await position.function;
      const administrativeUnit = await position.worshipService;
      //const classification =  administrativeUnit.classification;
      const mContacts = await minister.contacts;
      const primaryContact = findPrimaryContact(mContacts);
      const secondaryContact = findSecondaryContact(mContacts);
      contacts.push({
        title: `${role.label}, ${administrativeUnit.name}`,
        role: role.label,
        startDate: minister.agentStartDate, // todo maybe wrong
        endDate: minister.agentEndDate, // todo maybe wrong
        unitId: administrativeUnit.id,
        unitName: administrativeUnit.name,
        // classification: classification,
        primaryContact: await this.mapContact(primaryContact),
        secondaryContact: await this.mapContact(secondaryContact),
      });
    }
    console.log(contacts);
    return {
      person,
      contacts,
    };
  }
  async mapContact(contact) {
    if (!contact) return null;
    return {
      email: contact.email,
      telephone: contact.telephone,
      fax: contact.fax,
      website: contact.website,
      contactAddress: await contact.contactAddress,
    };
  }
  isActivePosition(endDate) {
    if (!endDate) {
      // No end date set, so the position is still active
      return true;
    } else {
      return isDateInTheFuture(endDate);
    }
  }
}
function isDateInTheFuture(date) {
  assert('endDate should be a Date instance', date instanceof Date);
  let today = new Date();

  return date - today >= 0;
}
