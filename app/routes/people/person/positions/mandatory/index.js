import Route from '@ember/routing/route';
import {
  findPrimaryContact,
  findSecondaryContact,
} from 'frontend-organization-portal/models/contact-point';

export default class PeoplePersonPositionsMandatoryIndexRoute extends Route {
  async model() {
    let { person, mandatory } = this.modelFor(
      'people.person.positions.mandatory'
    );

    let contacts = await mandatory.contacts;
    let contact = findPrimaryContact(contacts);
    let address = await contact?.contactAddress;
    let secondaryContact = findSecondaryContact(contacts);

    return {
      person,
      mandatory,
      address,
      contact,
      secondaryContact,
    };
  }
}
