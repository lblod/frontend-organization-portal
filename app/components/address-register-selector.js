import Component from '@glimmer/component';
import { service } from '@ember/service';
import { findRecord } from '@warp-drive/legacy/compat/builders';
import { task, restartableTask, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class AddressRegisterSelectorComponent extends Component {
  @service addressRegister;
  @service store;

  @tracked addressSuggestion;

  sourceCrab;

  constructor() {
    super(...arguments);

    this.addressRegister.setup({ endpoint: '/adresses-register' });
    if (this.args.address) {
      let addressSuggestion = this.args.address;

      if (!this.addressRegister.isEmpty(addressSuggestion)) {
        this.addressSuggestion = addressSuggestion;
      }
    }
  }

  selectSuggestion = task(async (addressSuggestion) => {
    this.args.onChange(null);
    this.addressSuggestion = addressSuggestion;

    if (addressSuggestion) {
      const addresses = await this.addressRegister.findAll(addressSuggestion);

      if (!this.sourceCrab) {
        const { content: sourceCrab } = await this.store.request(
          findRecord('concept', 'e59c97a9-4e95-4d65-9696-756de47fbc1f'),
        );
        this.sourceCrab = sourceCrab;
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
            ]),
          ).values(),
        ],
      });
    }
  });

  search = restartableTask(async (searchData) => {
    await timeout(400);
    const addressSuggestions = await this.addressRegister.suggest(searchData);

    /*
      Filtering out addresses from Brussel's province.
      They can be suggested by the service but the address will then not be found in
      the Basisregister, which only lists addresses in Flanders, causing validation errors.
    */
    const filteredAddressSuggestions = addressSuggestions.filter((address) => {
      return address.zipCode < 1000 || address.zipCode > 1299;
    });

    return filteredAddressSuggestions;
  });
}
