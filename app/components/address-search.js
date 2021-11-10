import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class AddressSearchComponent extends Component {
  @service addressRegister;

  @tracked isAddressSearchMode = true;
  @tracked selectedAddress;
  @tracked addressWithBusNumber;
  @tracked addressesWithBusNumbers;

  get isManualInputMode() {
    return !this.isAddressSearchMode;
  }

  get isBusNumberSelectionDisabled() {
    return !this.addressWithBusNumber;
  }

  get showBusNumbersNotAvailableMessage() {
    return Boolean(this.selectedAddress) && !this.addressWithBusNumber;
  }

  constructor() {
    super(...arguments);

    this.detectInitialInputMode();

    if (this.isAddressSearchMode) {
      let addressWithBusNumber = this.addressRegister.toAddressSuggestion(
        this.args.address
      );

      if (!addressWithBusNumber.isEmpty()) {
        this.addressWithBusNumber = addressWithBusNumber;
      }
    }
  }

  @action
  toggleInputMode() {
    this.isAddressSearchMode = !this.isAddressSearchMode;
    this.selectedAddress = null;
    this.addressWithBusNumber = null;
    this.addressesWithBusNumbers = null;

    if (this.isManualInputMode) {
      this.args.address.source = null;
      this.args.address.addressRegisterUrl = null;
    }
  }

  @action
  handleAddressChange(data) {
    const addresses = data?.addresses;
    const source = data?.source;

    this.selectedAddress = null;
    this.addressWithBusNumber = null;
    this.addressesWithBusNumbers = null;
    this.resetAddressAttributes();

    if (addresses) {
      let hasBusNumberData = addresses.length > 1;
      let firstAddress = addresses[0];
      this.selectedAddress = firstAddress;

      if (hasBusNumberData) {
        this.addressesWithBusNumbers = addresses;
        this.handleBusNumberChange(firstAddress);
      } else {
        this.updateAddressAttributes(firstAddress.adresProperties, source);
      }
    }
  }

  @action
  handleBusNumberChange(address) {
    this.addressWithBusNumber = address;
    this.updateAddressAttributes(address?.adresProperties);
  }

  detectInitialInputMode() {
    if (typeof this.args.isSearchEnabledInitially === 'boolean') {
      this.isAddressSearchMode = this.args.isSearchEnabledInitially;
    } else {
      this.isAddressSearchMode = true;
    }
  }

  updateAddressAttributes(address, source) {
    this.args.address.setProperties({
      street: address.straatnaam,
      number: address.huisnummer,
      boxNumber: address.busnummer,
      postcode: address.postcode,
      source,
      municipality: address.gemeentenaam,
      province: null,
      addressRegisterUri: address.addressRegisterUri,
    });
  }

  resetAddressAttributes() {
    this.args.address.setProperties({
      street: null,
      number: null,
      boxNumber: null,
      postcode: null,
      source: null,
      municipality: null,
      province: null,
      addressRegisterUri: null,
    });
  }
}
