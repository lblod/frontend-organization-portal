import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default class PropagateContactDetailsUpdateComponent extends Component {
  @tracked positions;
  @tracked selectedPositions;
  @service store;

  constructor() {
    super(...arguments);
    this.positions = this.args.positions;
    this.selectedPositions = [];
  }

  @dropTask
  *save() {
    let { primaryContact, secondaryContact } = this.args.newContactDetails;
    for (const computedPosition of this.selectedPositions) {
      let { position } = computedPosition;
      position.contacts.clear();
      position.contacts.pushObjects([primaryContact, secondaryContact]);
      yield position.save();
    }
    this.args.onSave();
  }

  @action
  select(contact) {
    contact.selected = !contact.selected;
    if (this.contains(contact)) {
      this.selectedPositions = this.selectedPositions.filter(
        (p) => p === contact
      );
    } else {
      this.selectedPositions.push(contact);
    }
    this.positions = [...this.positions]; // force reload checkboxes
  }

  @action
  contains(contact) {
    return this.selectedPositions.includes(contact);
  }
}
