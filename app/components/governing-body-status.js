import Component from '@glimmer/component';

export default class GoverningBodyStatusComponent extends Component {
  get isActive() {
    const today = new Date();

    if (this.args.startDate) {
      if (!this.args.endDate || this.args.endDate > today) {
        return true;
      } else {
        return false;
      }
    } else if (this.args.endDate) {
      return this.args.endDate > today;
    }
    return null;
  }
}
