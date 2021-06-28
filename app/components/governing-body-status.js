import Component from '@glimmer/component';

export default class GoverningBodyStatusComponent extends Component {
  get isActive() {
    if (this.args.date) {
      var today = new Date();
      if (this.args.date > today) {
        return true;
      } else {
        return false;
      }
    }
    return null;
  }
}
