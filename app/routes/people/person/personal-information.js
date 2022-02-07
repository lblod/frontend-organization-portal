import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { assert } from '@ember/debug';
import {
  findPrimaryContact,
  findSecondaryContact,
} from 'frontend-contact-hub/models/contact-point';

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
    const positions = [];
    const mandatories = person.mandatories.toArray();

    const ministers = person.agentsInPosition.toArray();

    for (let mandatory of mandatories) {
      const mandate = await mandatory.mandate;
      if (!this.isActivePosition(mandate.endDate)) {
        break;
      }
      const role = await mandate.roleBoard;
      const governingBody = await mandate.governingBody;
      const isTimeSpecializationOf = await governingBody.isTimeSpecializationOf;
      const administrativeUnit =
        await isTimeSpecializationOf.administrativeUnit;
      const mContacts = await mandatory.contacts;
      const primaryContact = findPrimaryContact(mContacts);
      const secondaryContact = findSecondaryContact(mContacts);
      positions.push({
        title: `${role.label}, ${administrativeUnit.name}`,
        role: role.label,
        type: 'mandatory',
        id: mandatory.id,
        startDate: mandate.startDate,
        endDate: mandate.endDate,
        administrativeUnit,
        primaryContact: primaryContact,
        secondaryContact: secondaryContact,
      });
    }

    for (let minister of ministers) {
      if (!this.isActivePosition(minister.agentEndDate)) {
        break;
      }
      const position = await minister.position;
      const role = await position.function;
      const administrativeUnit = await position.worshipService;
      const mContacts = await minister.contacts;
      const primaryContact = findPrimaryContact(mContacts);
      const secondaryContact = findSecondaryContact(mContacts);
      positions.push({
        title: `${role.label}, ${administrativeUnit.name}`,
        role: role.label,
        type: 'minister',
        id: minister.id,
        startDate: minister.agentStartDate,
        endDate: minister.agentEndDate,
        administrativeUnit,
        primaryContact: primaryContact,
        secondaryContact: secondaryContact,
      });
    }
    return {
      person,
      positions: positions.sort((a, b) => {
        return b.startDate - a.startDate;
      }),
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
