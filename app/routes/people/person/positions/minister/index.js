import Route from '@ember/routing/route';
import {
  findPrimaryContact,
  findSecondaryContact,
} from 'frontend-contact-hub/models/contact-point';

export default class PeoplePersonPositionsMinisterIndexRoute extends Route {
  async model() {
    let { person, minister } = this.modelFor(
      'people.person.positions.minister'
    );

    let contacts = await minister.contacts;
    let contact = findPrimaryContact(contacts);
    let address = await contact?.contactAddress;
    let secondaryContact = findSecondaryContact(contacts);

    return {
      person,
      minister,
      address,
      contact,
      secondaryContact,
    };
  }
}
