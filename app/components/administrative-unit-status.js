import Component from '@glimmer/component';

export default class AdministrativeUnitStatusComponent extends Component {
  get getStatusSkin() {
    if (this.args.status === 'Actief') {
      return 'success';
    } else if (this.args.status === 'In oprichting') {
      return 'warning';
    } else {
      return 'error';
    }
  }
}
