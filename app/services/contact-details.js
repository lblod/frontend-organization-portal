import Service, { inject as service } from '@ember/service';
import { isActivePosition } from 'frontend-organization-portal/utils/position';
import {
  findPrimaryContact,
  findSecondaryContact,
} from 'frontend-organization-portal/models/contact-point';

export default class ContactDetailsService extends Service {
  @service store;

  async ministerToPosition(minister, onlyActivePosition = true) {
    if (onlyActivePosition && !isActivePosition(minister.agentEndDate)) {
      return null;
    }
    const position = await minister.ministerPosition;
    const role = await position.function;
    const administrativeUnit = await position.worshipService;
    const mContacts = await minister.contacts;
    const primaryContact = findPrimaryContact(mContacts);
    const secondaryContact = findSecondaryContact(mContacts);

    return {
      position: minister,
      title: `${role.label}, ${administrativeUnit.name}`,
      role: role.label,
      type: 'minister',
      id: minister.id,
      startDate: minister.agentStartDate,
      endDate: minister.agentEndDate,
      administrativeUnit,
      primaryContact: primaryContact,
      secondaryContact: secondaryContact,
    };
  }

  async mandatoryToPosition(mandatory, onlyActivePosition = true) {
    const mandate = await mandatory.mandate;
    if (onlyActivePosition && !isActivePosition(mandatory.endDate)) {
      return null;
    }
    const role = await mandate.roleBoard;
    const status = await mandatory.status;
    const governingBody = await mandate.governingBody;
    const isTimeSpecializationOf = await governingBody.isTimeSpecializationOf;
    const administrativeUnit = await isTimeSpecializationOf.administrativeUnit;
    const mContacts = await mandatory.contacts;
    const primaryContact = findPrimaryContact(mContacts);
    const secondaryContact = findSecondaryContact(mContacts);
    return {
      position: mandatory,
      title: `${role.label}, ${administrativeUnit.name}`,
      role: role.label,
      type: 'mandatory',
      status,
      id: mandatory.id,
      startDate: mandatory.startDate,
      endDate: mandatory.endDate,
      administrativeUnit,
      primaryContact: primaryContact,
      secondaryContact: secondaryContact,
    };
  }

  async functionaryToPosition(functionary, onlyActivePosition = true) {
    const boardPosition = await functionary.boardPosition;

    if (onlyActivePosition && !isActivePosition(functionary.endDate)) {
      return null;
    }

    const role = await boardPosition.roleBoard;
    const status = await functionary.status;
    const governingBodies = await boardPosition.governingBodies;

    let administrativeUnits = [];
    for (const governingBody of governingBodies.toArray()) {
      const isTimeSpecializationOf = await governingBody.isTimeSpecializationOf;
      const administrativeUnit =
        await isTimeSpecializationOf.administrativeUnit;

      administrativeUnits.push(administrativeUnit);
    }

    const primaryContact = await boardPosition.contactPoint;

    return {
      position: functionary,
      title: `${role.label}, ${administrativeUnits[0].name}`,
      role: role.label,
      type: 'functionary',
      id: functionary.id,
      startDate: functionary.startDate,
      endDate: functionary.endDate,
      administrativeUnits,
      status,
      primaryContact,
    };
  }

  async getPersonAndAllPositions(personId) {
    let person = await this.store.findRecord('person', personId, {
      reload: true,
    });
    const positions = [];

    const mandatories = (await person.mandatories).toArray(); // mandatarissen
    const functionaries = (await person.functionaries).toArray(); // leidinggevenden
    const ministers = (await person.agentsInPosition).toArray(); // bedienaren

    for (let mandatory of mandatories) {
      const position = await this.mandatoryToPosition(mandatory);
      if (position) {
        positions.push(position);
      }
    }

    for (let functionary of functionaries) {
      const position = await this.functionaryToPosition(functionary);
      if (position) {
        positions.push(position);
      }
    }

    for (let minister of ministers) {
      const position = await this.ministerToPosition(minister);
      if (position) {
        positions.push(position);
      }
    }

    return {
      person,
      positions: positions.sort((a, b) => {
        return b.startDate - a.startDate;
      }),
    };
  }
}
