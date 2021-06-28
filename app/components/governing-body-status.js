import Component from '@glimmer/component';

export default class GoverningBodyStatusComponent extends Component {
  get statusLabel() {
    let status = '';
    if (this.args.date) {
      var today = new Date();
      if (this.args.date > today) {
        status = 'Actief';
      } else {
        status = 'Niet Actief';
      }
    }
    return status;
  }

  get statusSkin() {
    let skin = '';
    if (this.args.date) {
      var today = new Date();
      if (this.args.date > today) {
        skin = 'success';
      } else {
        skin = 'error';
      }
    }
    return skin;
  }
}
