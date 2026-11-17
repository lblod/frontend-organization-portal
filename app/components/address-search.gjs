import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { uniqueId } from '@ember/helper';
import AddressRegisterSelector from './address-register-selector';
import AuHelpText from '@appuniversum/ember-appuniversum/components/au-help-text';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { on } from '@ember/modifier';
import not from 'ember-truth-helpers/helpers/not';
import AddressRegisterBusNumberSelector from './address-register-bus-number-selector';
import AuLinkExternal from '@appuniversum/ember-appuniversum/components/au-link-external';
import config from 'ember-config-helper/helpers/config';

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
  }

  @action
  toggleInputMode() {
    this.isAddressSearchMode = !this.isAddressSearchMode;
    this.selectedAddress = null;
    this.addressWithBusNumber = null;
    this.addressesWithBusNumbers = null;

    if (this.isManualInputMode) {
      this.args.address.source = null;
      this.args.address.addressRegisterUri = null;
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
        this.updateAddressAttributes(firstAddress, source);
      }
    }
  }

  @action
  handleBusNumberChange(address) {
    this.addressWithBusNumber = address;
    this.updateAddressAttributes(address);
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
      street: address.street,
      number: address.housenumber,
      boxNumber: address.busNumber,
      postcode: address.zipCode,
      source,
      municipality: address.municipality,
      province: null,
      country: address.country,
      addressRegisterUri: address.uri,
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
      country: null,
      addressRegisterUri: null,
    });
  }

  <template>
    {{#let @itemComponent (uniqueId) as |Item id|}}
      {{#if this.isAddressSearchMode}}
        <Item
          @labelFor="{{id}}-address-search"
          @required={{@required}}
          @errorMessage={{if @error "Selecteer een adres"}}
          @alignTop={{true}}
        >
          <:label>Adres</:label>
          <:content as |errorMessage|>
            <AddressRegisterSelector
              @id="{{id}}-address-search"
              @address={{@address}}
              @onChange={{this.handleAddressChange}}
              @error={{errorMessage}}
            />
            {{#if errorMessage}}
              <AuHelpText @error={{true}}>{{errorMessage}}</AuHelpText>
            {{/if}}
            <p class="au-u-margin-top-tiny">
              <AuButton @skin="link" {{on "click" this.toggleInputMode}}>
                Vul adres manueel in
              </AuButton>
            </p>
          </:content>
          <:error>{{! Disable the default error message}}</:error>
        </Item>
        <Item
          @labelFor="{{id}}-address-search-bus-select"
          @required={{not this.isBusNumberSelectionDisabled}}
        >
          <:label>Busnummer</:label>
          <:content>
            <AddressRegisterBusNumberSelector
              @id="{{id}}-address-search-bus-select"
              @address={{this.addressWithBusNumber}}
              @options={{this.addressesWithBusNumbers}}
              @onChange={{this.handleBusNumberChange}}
              @disabled={{this.isBusNumberSelectionDisabled}}
              @placeholder={{if
                this.showBusNumbersNotAvailableMessage
                "Geen busnummer beschikbaar"
              }}
            />
            {{#if this.selectedAddress}}
              <AuHelpText>
                Staat het correcte busnummer niet in de lijst?
                <AuLinkExternal href="mailto:{{config 'contactEmail'}}">Mail ons</AuLinkExternal>
              </AuHelpText>
            {{/if}}
          </:content>
        </Item>
        {{yield to="commonInput"}}
      {{else}}
        {{yield to="manualAddressInputBeforeButton"}}
        <Item>
          <:content>
            <AuButton @skin="link" {{on "click" this.toggleInputMode}}>
              Vind adres in lijst
            </AuButton>
          </:content>
        </Item>
        {{yield to="manualAddressInput"}}
        {{yield to="commonInput"}}
      {{/if}}
    {{/let}}
  </template>
}
