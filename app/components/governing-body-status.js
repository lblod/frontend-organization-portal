import Component from '@glimmer/component';

export default class GoverningBodyStatusComponent extends Component {
  get isActive() {
    const today = new Date();

    const start_unknown = !this.args.startDate;
    const start_in_past = this.args.startDate && this.args.startDate < today;
    const end_unknown = !this.args.endDate;
    const end_in_future = this.args.endDate && this.args.endDate > today;

    return (
      (start_in_past && (end_in_future || end_unknown)) ||
      (start_unknown && end_in_future)
    );
  }
}
