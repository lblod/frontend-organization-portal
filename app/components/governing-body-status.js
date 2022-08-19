import Component from '@glimmer/component';

export default class GoverningBodyStatusComponent extends Component {
  get isActive() {
    const today = new Date();

    if (this.args.startDate) {
      return !this.args.endDate || this.args.endDate > today;
    } else if (this.args.endDate) {
      return this.args.endDate > today;
    } else {
      return false;
    }
  }
}
