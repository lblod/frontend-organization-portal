import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { createValidatedChangeset } from 'frontend-organization-portal/utils/changeset';
import contactValidations from 'frontend-organization-portal/validations/contact-point';
import { combineFullAddress } from 'frontend-organization-portal/models/address';
import { getAddressValidations } from 'frontend-organization-portal/validations/address';
import {
  createPrimaryContact,
  createSecondaryContact,
} from 'frontend-organization-portal/models/contact-point';
export default class ContactDetailsComponent extends Component {
  @tracked editingContact;
  @tracked test = false;
  @tracked positions;
  @tracked selectedContact;
  @service store;
  @service router;

  constructor() {
    super(...arguments);
    this.selectedContact = this.args.contact;
    this.positions = this.reloadPositions();
  }

  reloadPositions() {
    return this.args.positions.filter((cp) => {
      let res =
        cp.position.id === this.selectedContact.position.id ||
        (cp.position.id !== this.selectedContact.position.id &&
          cp.primaryContact?.id !== this.selectedContact.primaryContact?.id) ||
        cp.secondaryContact?.id !== this.selectedContact.secondaryContact?.id ||
        cp.address?.id !== this.selectedContact.address?.id;
      return res;
    });
  }

  @action
  async editContact(contact) {
    if (!contact) {
      this.editingContact.primaryContact?.rollback();
      this.editingContact.secondaryContact?.rollback();
      this.editingContact.address?.rollback();
      this.editingContact.position.rollbackAttributes();
      this.editingContact = null;
    } else {
      let { primaryContact, secondaryContact, address, position, title } =
        contact;
      if (!primaryContact) {
        const pc = createPrimaryContact(this.store);
        position.contacts.pushObject(pc);
        primaryContact = createValidatedChangeset(pc, contactValidations);
      }
      if (!secondaryContact) {
        const sc = createSecondaryContact(this.store);
        position.contacts.pushObject(sc);
        secondaryContact = createValidatedChangeset(sc, contactValidations);
      }
      if (!address) {
        const addr = this.store.createRecord('address');
        primaryContact.contactAddress = addr;
        address = createValidatedChangeset(addr, getAddressValidations());
      }
      this.editingContact = {
        primaryContact,
        secondaryContact,
        address,
        position,
        title,
      };
    }
  }

  @action
  async newContact(computedPosition) {
    let { position, title } = computedPosition;
    let primaryContact = createPrimaryContact(this.store);
    let secondaryContact = createSecondaryContact(this.store);
    let address = this.store.createRecord('address');
    primaryContact.contactAddress = address;
    position.contacts.clear();
    position.contacts.pushObject(primaryContact);
    position.contacts.pushObject(secondaryContact);
    const editing = {
      position,
      title,
      primaryContact: createValidatedChangeset(
        primaryContact,
        contactValidations
      ),
      secondaryContact: createValidatedChangeset(
        secondaryContact,
        contactValidations
      ),
      address: createValidatedChangeset(address, getAddressValidations()),
    };
    this.selectedContact = { ...editing };
    this.editingContact = editing;
  }

  @action
  copy(computedPosition) {
    if (computedPosition === this.selectedContact) {
      // do nothing
    } else {
      let { primaryContact, secondaryContact, address } = computedPosition;
      let { position, title } = this.selectedContact;
      position.contacts.clear();
      position.contacts.pushObject(primaryContact);
      if (secondaryContact) {
        position.contacts.pushObject(secondaryContact);
      }
      //yield position.save();
      this.selectedContact = {
        position,
        title,
        primaryContact,
        secondaryContact,
        address,
      };
      //yield this.args?.onCopy(this.selectedContact);
    }
  }

  @dropTask
  *saveContact(event) {
    event.preventDefault();
    let { primaryContact, secondaryContact, address, position, title } =
      this.editingContact;
    yield primaryContact.validate();
    yield secondaryContact.validate();
    yield address.validate();
    let valid =
      primaryContact.isValid && secondaryContact.isValid && address.isValid;
    if (valid) {
      if (address.isDirty) {
        address.fullAddress = combineFullAddress(address);
      }
      primaryContact.contactAddress = address;

      yield this.args.onUpdate(this.editingContact);
      this.positions = [
        ...this.reloadPositions(),
        {
          primaryContact,
          secondaryContact,
          address,
          position,
          title,
        },
      ];
      this.editingContact = null;
    }
  }
}
