import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

const ID_NAME = {
  SSN: 'Rijksregisternummer',
};

export default class PeopleNewRoute extends Route {
  @service store;

  model() {
    return {
      person: this.store.createRecord('person'),
      dateOfBirth: this.store.createRecord('date-of-birth'),
      identifierSSN: this.store.createRecord('identifier', {
        idName: ID_NAME.SSN,
      }),
      structuredIdentifierSSN: this.store.createRecord('structured-identifier'),
    };
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
