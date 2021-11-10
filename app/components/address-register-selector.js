import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task, restartableTask, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class AddressRegisterSelectorComponent extends Component {
  @service addressRegister;
  @service store;

  @tracked addressSuggestion;

  sourceCrab;

  constructor() {
    super(...arguments);

    if (this.args.address) {
      let addressSuggestion = this.addressRegister.toAddressSuggestion(
        this.args.address
      );

      if (!addressSuggestion.isEmpty()) {
        this.addressSuggestion = addressSuggestion;
      }
    }
  }

  @task
  *selectSuggestion(addressSuggestion) {
    this.addressSuggestion = addressSuggestion;

    if (addressSuggestion) {
      const addresses = yield this.addressRegister.findAll(addressSuggestion);
      if (!this.sourceCrab) {
        this.sourceCrab = yield this.store.findRecord(
          'concept',
          'e59c97a9-4e95-4d65-9696-756de47fbc1f'
        );
      }
      // TODO: this should probably be fixed in the API itself (, if possible)
      // avoid duplicates, e.g Liebaardstnaat 10, 8792 Waregem
      this.args.onChange({
        source: this.sourceCrab,
        addresses: [
          ...new Map(
            addresses.map((a) => [
              `${a.street}${a.housenumber}${a.busNumber}`,
              a,
            ])
          ).values(),
        ],
      });
    } else {
      this.args.onChange(null);
    }
  }

  @restartableTask
  *search(searchData) {
    yield timeout(400);
    const addressSuggestions = yield this.addressRegister.suggest(searchData);
    return addressSuggestions;
  }
}
