import { set } from '@ember/object';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { keepLatestTask, task, timeout } from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class AddressRegisterSelectorComponent extends Component {
  @service() addressRegister;

  @tracked address = null;
  @tracked addressSuggestion;
  @tracked addressesWithBusNumbers;
  @tracked addressWithBusNumber;

  get isDisabledBusNumberSelect() {
    return this.addressWithBusNumber || true;
  }

  constructor() {
    super(...arguments);
    this.getAddressInfo();
  }
  async getAddressInfo() {
    const address = await this.args.address;
    if (address) {
      this.addressSuggestion = await this.addressRegister.toAddressSuggestion(
        address
      );
      const addresses = await this.addressRegister.findAll(
        this.addressSuggestion
      );
      if (addresses.length > 1) {
        const selectedAddress = addresses.find(
          (a) => a.busNumber == address.busnummer
        );
        this.addressesWithBusnumbers = addresses.sortBy('busNumber');
        set(this, 'addressWithBusNumber', selectedAddress);
      } else {
        this.addressesWithBusnumbers = null;
        set(this, 'addressWithBusNumber', null);
      }
    }
  }
  @task
  *selectSuggestion(addressSuggestion) {
    this.addressesWithBusnumbers = null;
    set(this, 'addressWithBusNumber', null);
    this.addressSuggestion = addressSuggestion;

    if (addressSuggestion) {
      const addresses = yield this.addressRegister.findAll(addressSuggestion);
      if (addresses.length == 1) {
        this.args.onChange(addresses[0].adresProperties);
      } else {
        // selection of busNumber required
        const sortedBusNumbers = addresses.sortBy('busNumber');
        this.addressesWithBusnumbers = sortedBusNumbers;
        set(this, 'addressWithBusNumber', sortedBusNumbers[0]);
        this.args.onChange(this.addressWithBusNumber.adresProperties);
      }
    } else {
      this.args.onChange(null);
    }
  }

  @keepLatestTask
  *search(searchData) {
    yield timeout(400);
    const addressSuggestions = yield this.addressRegister.suggest(searchData);
    return addressSuggestions;
  }

  @action
  selectAddressWithBusNumber(address) {
    set(this, 'addressWithBusNumber', address);
    this.args.onChange(address.adresProperties);
  }
}
