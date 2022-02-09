import Route from '@ember/routing/route';
import { createValidatedChangeset } from 'frontend-contact-hub/utils/changeset';
import personValidations from 'frontend-contact-hub/validations/person';
import { inject as service } from '@ember/service';
import contactValidations from 'frontend-contact-hub/validations/contact-point';
import { getAddressValidations } from 'frontend-contact-hub/validations/address';

export default class PeoplePersonPersonalInformationEditRoute extends Route {
  @service currentSession;
  @service router;

  beforeModel() {
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('route-not-found', {
        wildcard: 'pagina-niet-gevonden',
      });
    }
  }
  async model() {
    let { person, positions } = this.modelFor(
      'people.person.personal-information'
    );
    const contacts = [];
    for (let position of positions) {
      let address = await position.primaryContact.contactAddress;
      let contact = {
        title: 'Contactgegevens: ' + position.title,
        primaryContact: createValidatedChangeset(
          position.primaryContact,
          contactValidations
        ),
        address: createValidatedChangeset(address, getAddressValidations),
        secondaryContact: createValidatedChangeset(
          position.secondaryContact,
          contactValidations
        ),
      };
      contacts.push(contact);
    }

    return {
      person: createValidatedChangeset(person, personValidations),
      contacts,
    };
  }
}
