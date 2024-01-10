import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class ContactEditCard extends Component {
  @action
  updateCountry(value) {
    this.args.address.country = value;
    this.args.address.municipality = null;
    this.args.address.province = null;
  }
}
