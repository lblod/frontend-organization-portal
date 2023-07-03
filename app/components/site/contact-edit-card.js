import Component from '@glimmer/component';

export default class ContactEditCard extends Component {
  get isCountryBelgium() {
    return this.args.address.country == 'België';
  }
}
